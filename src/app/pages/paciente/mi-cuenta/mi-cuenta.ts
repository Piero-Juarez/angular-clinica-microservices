import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {AuthService} from '../../../core/auth/auth.service';
import {PersonApiService} from '../../../services/person-api.service';
import {PatientData} from '../../../models/person/patient/patient-data';
import {UpdatePatientRequest} from '../../../models/person/patient/update-patient-request';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'mi-cuenta-paciente',
  templateUrl: './mi-cuenta.html',
  imports: [
    FormsModule
  ],
  styleUrl: './mi-cuenta.css'
})
export class MiCuentaPaciente implements OnInit {

  private authService = inject(AuthService)
  private personApiService = inject(PersonApiService)
  private cdr = inject(ChangeDetectorRef)

  patientProfile: PatientData | null = null
  isLoading = true

  // Variables para el Modal
  showEditModal = false
  isUpdating = false
  updateData: UpdatePatientRequest = {
    phone: '',
    address: '',
    ubigeo: '',
    healthInsurance: '',
    policyNumber: '',
    occupation: '',
    maritalStatus: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  }

  ngOnInit(): void {
    this.loadProfile()
  }

  loadProfile() {
    const userId = this.authService.getUserId()
    if (!userId) return

    this.isLoading = true
    this.personApiService.getPatientById(userId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patientProfile = res.data
        }
        this.isLoading = false
        this.cdr.detectChanges()
      },
      error: (err) => {
        console.error()
        this.isLoading = false
        this.cdr.detectChanges()
      }
    });
  }

  // ==========================================
  // LÓGICA DEL MODAL DE EDICIÓN
  // ==========================================
  abrirModalEditar() {
    if (!this.patientProfile) return;

    // Pre-llenamos el formulario con los datos actuales
    this.updateData = {
      phone: this.patientProfile.personData.phone || '',
      address: this.patientProfile.personData.address || '',
      ubigeo: this.patientProfile.personData.ubigeo || '',
      healthInsurance: this.patientProfile.healthInsurance || '',
      policyNumber: this.patientProfile.policyNumber || '',
      occupation: this.patientProfile.occupation || '',
      maritalStatus: this.patientProfile.maritalStatus || 'SINGLE', // Valor por defecto
      emergencyContactName: this.patientProfile.emergencyContactName || '',
      emergencyContactPhone: this.patientProfile.emergencyContactPhone || '',
      emergencyContactRelation: this.patientProfile.emergencyContactRelation || ''
    };
    this.showEditModal = true;
  }

  cerrarModalEditar() {
    this.showEditModal = false;
  }

  guardarCambios() {
    this.isUpdating = true;

    this.personApiService.updateMyPatientProfile(this.updateData).subscribe({
      next: (res) => {
        this.isUpdating = false;
        if (res.success) {
          this.cerrarModalEditar();
          this.loadProfile();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isUpdating = false;
        alert(err.error?.message || 'Error al actualizar tus datos.');
        this.cdr.detectChanges();
      }
    });
  }

}
