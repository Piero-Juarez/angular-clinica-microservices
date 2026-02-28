import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {PersonApiService} from '../../../services/person-api.service';
import {DoctorData} from '../../../models/person/doctor/doctor-data';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'listado-medicos',
  templateUrl: './listado-medicos.html',
  imports: [
    FormsModule
  ],
  styleUrl: './listado-medicos.css'
})
export class ListadoMedicos implements OnInit {

  private personApiService = inject(PersonApiService)
  private cdr = inject(ChangeDetectorRef)

  doctors: DoctorData[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  isLoading = true;

  // Variables de Búsqueda
  specialtySearch = '';
  searchCredentialType = 'CMP'; // Valor por defecto del selector
  searchCredentialValue = '';
  searchError = '';

  // Variables para el Modal
  showModal = false;
  doctorToDisable: string | null = null;
  isDisabling = false;

  ngOnInit(): void {
    this.loadDoctors(0);
  }

  loadDoctors(page: number) {
    this.isLoading = true;
    this.currentPage = page;

    this.personApiService.getAllDoctors(this.specialtySearch.trim(), this.currentPage, 10).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.doctors = res.data.content;
          this.totalPages = res.data.page.totalPages;
          this.totalElements = res.data.page.totalElements;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        console.error();
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // LÓGICA DE BÚSQUEDA COMBINADA
  // ==========================================
  onSearch() {
    const credValue = this.searchCredentialValue.trim();

    // Si el usuario ingresó una credencial, priorizamos esa búsqueda exacta
    if (credValue) {
      this.buscarPorCredencial(credValue);
    } else {
      // Si no, buscamos por especialidad (o traemos todos si está vacío)
      this.loadDoctors(0);
    }
  }

  buscarPorCredencial(valor: string) {
    this.isLoading = true;
    this.searchError = '';
    this.specialtySearch = '';

    const cmp = this.searchCredentialType === 'CMP' ? valor : '';
    const rne = this.searchCredentialType === 'RNE' ? valor : '';

    this.personApiService.getDoctorByCredentials(cmp, rne).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.doctors = [res.data];
          this.totalPages = 1;
          this.totalElements = 1;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.doctors = [];
        this.searchError = `No se encontró ningún médico con el ${this.searchCredentialType}: ${valor}`;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  limpiarFiltros() {
    this.specialtySearch = '';
    this.searchCredentialValue = '';
    this.searchError = '';
    this.loadDoctors(0);
  }

  // ==========================================
  // LÓGICA DEL MODAL DE DESHABILITAR
  // ==========================================
  abrirModalDeshabilitar(id: string) {
    this.doctorToDisable = id;
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.doctorToDisable = null;
  }

  confirmarDeshabilitacion() {
    if (!this.doctorToDisable) return;
    this.isDisabling = true;

    this.personApiService.deleteDoctor(this.doctorToDisable).subscribe({
      next: (res) => {
        this.isDisabling = false;
        if (res.success) {
          this.cerrarModal();
          this.loadDoctors(this.currentPage);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error();
        this.isDisabling = false;
        alert(err.error?.message || 'Error al intentar deshabilitar al médico.');
        this.cdr.detectChanges();
      }
    });
  }

}
