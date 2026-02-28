import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {MedicalhistoryApiService} from '../../../services/medicalhistory-api.service';
import {MedicalHistoryResponse} from '../../../models/medical-history/medical-history-response';
import {DatePipe} from '@angular/common';
import {forkJoin} from 'rxjs';
import {PersonApiService} from '../../../services/person-api.service';

@Component({
  selector: 'historial-medico-paciente',
  templateUrl: './historial-medico.html',
  imports: [
    DatePipe
  ],
  styleUrl: './historial-medico.css'
})
export class HistorialMedicoPaciente implements OnInit {

  private medicalHistoryApiService = inject(MedicalhistoryApiService)
  private personApiService = inject(PersonApiService)
  private cdr = inject(ChangeDetectorRef)

  historyData: MedicalHistoryResponse | null = null

  doctorDictionary: { [id: string]: string } = {};

  isLoading = true
  errorMessage = ''
  currentPage = 0;
  totalPages = 0;

  ngOnInit(): void {
    this.loadHistory(0)
  }

  loadHistory(page: number) {
    this.isLoading = true;
    this.currentPage = page;

    this.medicalHistoryApiService.getMyMedicalHistoryPatient(this.currentPage, 10).subscribe({
      next: (res) => {
        this.historyData = res;
        this.totalPages = res.consultations.page.totalPages;

        this.loadDoctorsForHistory();
      },
      error: (err) => {
        console.error();
        this.errorMessage = 'No se pudo cargar tu historial médico.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadDoctorsForHistory() {
    const consultas = this.historyData?.consultations.content || [];
    if (consultas.length === 0) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    const uniqueDoctorIds = [...new Set(consultas.map(c => c.doctorId))];
    const requests = uniqueDoctorIds.map(id => this.personApiService.getDoctorById(id));

    forkJoin(requests).subscribe({
      next: (responses) => {
        responses.forEach((res, index) => {
          if (res.success && res.data) {
            const doc = res.data;
            this.doctorDictionary[uniqueDoctorIds[index]] = `${doc.personData.name} ${doc.personData.lastName} - ${doc.mainSpecialty}`;
          }
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

}
