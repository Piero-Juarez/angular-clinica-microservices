import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {PersonApiService} from '../../../services/person-api.service';
import {AdministrationData} from '../../../models/person/administration/administration-data';

@Component({
  selector: 'listado-administracion',
  templateUrl: './listado-administracion.html',
  styleUrl: './listado-administracion.css'
})
export class ListadoAdministracion implements OnInit {

  private personApiService = inject(PersonApiService)
  private cdr = inject(ChangeDetectorRef)

  admins: AdministrationData[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  isLoading = true;

  // Variables para el Modal
  showModal = false;
  adminToDisable: string | null = null;
  isDisabling = false;

  ngOnInit(): void {
    this.loadAdmins(0);
  }

  loadAdmins(page: number) {
    this.isLoading = true;
    this.currentPage = page;

    this.personApiService.getAllAdministrations(this.currentPage, 10).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.admins = res.data.content;
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
  // LÓGICA DEL MODAL DE DESHABILITAR
  // ==========================================
  abrirModalDeshabilitar(id: string) {
    this.adminToDisable = id;
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.adminToDisable = null;
  }

  confirmarDeshabilitacion() {
    if (!this.adminToDisable) return;
    this.isDisabling = true;

    this.personApiService.deleteAdministration(this.adminToDisable).subscribe({
      next: (res) => {
        this.isDisabling = false;
        if (res.success) {
          this.cerrarModal();
          this.loadAdmins(this.currentPage);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error();
        this.isDisabling = false;
        alert(err.error?.message || 'Error al intentar deshabilitar al usuario.');
        this.cdr.detectChanges();
      }
    });
  }

}
