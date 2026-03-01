import {ChangeDetectorRef, Component, inject} from '@angular/core';
import {AuthApiService} from '../../services/auth-api.service';
import {Router, RouterLink} from '@angular/router';
import {RegisterPatientRequestDTO} from '../../models/auth/register-request';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'registro-paciente',
  templateUrl: './registro-paciente.html',
  imports: [
    FormsModule,
    RouterLink
  ],
  styleUrl: './registro-paciente.css'
})
export class RegistroPaciente {

  private authApi = inject(AuthApiService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef)

  isProcessing = false;
  errorMessage = '';
  successMessage = '';

  patientData: RegisterPatientRequestDTO = {
    email: '',
    password: '',
    personData: { name: '', lastName: '', documentType: 'DNI', documentNumber: '', birthDate: '', biologicalSex: 'MASCULINO', phone: '', address: '', ubigeo: '' },
    patientData: { bloodType: '', healthInsurance: '', policyNumber: '', occupation: '', maritalStatus: 'SOLTERO', emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '', consentData: false }
  };

  registrar() {
    // Validación manual rápida del consentimiento
    if (!this.patientData.patientData.consentData) {
      this.errorMessage = 'Debes aceptar el tratamiento de datos para poder registrarte.';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authApi.registerPatient(this.patientData).subscribe({
      next: (res) => {
        this.isProcessing = false;
        if (res.success) {
          this.successMessage = '¡Tu cuenta ha sido creada con éxito! Redirigiendo al inicio de sesión...';
          // Esperamos 2.5 segundos para que lea el mensaje y lo enviamos al login
          setTimeout(() => {
            this.router.navigate(['/login']).then();}, 2500);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isProcessing = false;
        this.errorMessage = err.error?.message || 'Ocurrió un error al intentar crear tu cuenta. Verifica tus datos.';
        this.cdr.detectChanges();
      }
    });
  }

}
