import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {PersonApiService} from '../../../services/person-api.service';
import {PatientData} from '../../../models/person/patient/patient-data';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'listado-pacientes',
  templateUrl: './listado-pacientes.html',
  imports: [
    FormsModule
  ],
  styleUrl: './listado-pacientes.css'
})
export class ListadoPacientes implements OnInit {

  private personApiService = inject(PersonApiService)
  private cdr = inject(ChangeDetectorRef)

  patients: PatientData[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  isLoading = true;

  // Variables para búsqueda
  documentSearch = '';
  searchError = '';

  // Variables para el Modal de Deshabilitar
  showModal = false;
  patientToDisable: string | null = null;
  isDisabling = false;

  // Variables para el Modal de Perfil
  showProfileModal = false;
  selectedPatientProfile: PatientData | null = null;

  ngOnInit(): void {
    this.loadPatients(0);
  }

  loadPatients(page: number) {
    this.isLoading = true;
    this.currentPage = page;

    this.personApiService.getAllPatients(this.currentPage, 10).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patients = res.data.content;
          this.totalPages = res.data.page.totalPages;
          this.totalElements = res.data.page.totalElements;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error();
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // LÓGICA DE BÚSQUEDA POR DOCUMENTO
  // ==========================================
  onSearch() {
    const doc = this.documentSearch.trim();
    if (!doc) {
      this.loadPatients(0);
      return;
    }

    this.isLoading = true;
    this.searchError = '';

    this.personApiService.getPatientByDocumentNumber(doc).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patients = [res.data];
          this.totalPages = 1;
          this.totalElements = 1;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.patients = [];
        this.searchError = `No se encontró ningún paciente con el documento: ${doc}`;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  limpiarFiltro() {
    this.documentSearch = '';
    this.searchError = '';
    this.loadPatients(0);
  }

  // ==========================================
  // LÓGICA DEL MODAL DE PERFIL
  // ==========================================
  abrirModalPerfil(paciente: PatientData) {
    this.selectedPatientProfile = paciente;
    this.showProfileModal = true;
  }

  cerrarModalPerfil() {
    this.showProfileModal = false;
    this.selectedPatientProfile = null;
  }

  // ==========================================
  // LÓGICA DEL MODAL DE DESHABILITAR
  // ==========================================
  abrirModalDeshabilitar(id: string) {
    this.patientToDisable = id;
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.patientToDisable = null;
  }

  confirmarDeshabilitacion() {
    if (!this.patientToDisable) return;
    this.isDisabling = true;

    this.personApiService.deletePatient(this.patientToDisable).subscribe({
      next: (res) => {
        this.isDisabling = false;
        if (res.success) {
          this.cerrarModal();
          this.loadPatients(this.currentPage);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error();
        this.isDisabling = false;
        alert(err.error?.message || 'Error al intentar deshabilitar al paciente.');
        this.cdr.detectChanges();
      }
    });
  }

}
