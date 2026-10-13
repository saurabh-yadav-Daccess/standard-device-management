import { Component, ViewChild } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DataService } from '../../../services/data-service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-visitor-card-master',
  imports: [SharedModule, CommonModule],
  templateUrl: './visitor-card-master.html',
  styleUrl: './visitor-card-master.scss',
})
export class VisitorCardMaster {
  showFormData: boolean = false;
  showTableData: boolean = true;
  isEditMode: boolean = false;
  cardId: any;

  displayedColumns: string[] = ['Srno', 'visitorCardNumber', 'action'];

  getAllList: any = [];
  filterallData: any = [];
  dataSource = new MatTableDataSource([]);

  pageIndex = 0;
  pageSize = 10;
  pageStart = 0;
  pageEnd = 0;
  totalItems = 0;

  form!: FormGroup;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private fb: FormBuilder, private dataService: DataService, private toaster: ToastrService) {
    this.form = this.fb.group({
      visitorCardNumber: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getallData();
  }

  getallData() {
    this.dataService.getAllData('getAllVisitorCard').subscribe((res: any) => {
      if (res.code === 100) {
        this.getAllList = res.extend.allVisitorCard;
        this.filterallData = this.getAllList;
        this.dataSource = new MatTableDataSource(this.getAllList);
        this.dataSource.paginator = this.paginator;
      } else if (res.code === 500) {
        this.toaster.error('Internal server error!');
      } else {
        this.toaster.error('Something went wrong!');
      }
    }, (err) => {
      const errorMsg = err?.error?.msg || 'Failed to load Visitor Card list!';
      this.toaster.error(errorMsg);
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = { ...this.form.value };
      this.dataService.addDataC('addVisitorCard', formData).subscribe((res: any) => {
        if (res.code === 100) {
          this.toaster.success(res.msg || 'Visitor Card added successfully!');
          this.form.reset();
          this.pageIndex = 0;
          this.getallData();
          this.backtoList();
        } else if (res.code === 500) {
          this.toaster.error('Internal server error!');
        } else {
          this.toaster.error('Something went wrong!');
        }
      }, (err: any) => {
        const errorMsg = err?.error?.msg || 'Server side error!';
        this.toaster.error(errorMsg);
      });
    } else {
      this.form.markAllAsTouched();
      this.toaster.error('Please fill all required fields!');
    }
  }

  editData(id: any) {
    this.cardId = id;
    this.showFormData = true;
    this.showTableData = false;
    this.isEditMode = true;

    if (id) {
      this.dataService.getByIdC(`getVisitorCardById/${id}`).subscribe((res: any) => {
        if (res.code === 100) {
          const cardData = res.extend['Visitor-Card'];
          this.form.patchValue({
            visitorCardNumber: cardData.visitorCardNumber,
          });
        } else {
          this.toaster.error('No data found!');
        }
      }, (err: any) => {
        const errMsg = err?.error?.msg || 'Something went wrong!';
        this.toaster.error(errMsg);
      });
    }
  }

  onUpdate() {
    if (this.form.valid) {
      const formData = {
        visitor_card_id: this.cardId,
        visitorCardNumber: this.form.value.visitorCardNumber,
      };

      this.dataService.updateDataC('updateVisitorCard', formData).subscribe((res: any) => {
        if (res.code === 100) {
          this.toaster.success(res.msg || 'Visitor Card updated successfully!');
          this.getallData();
          this.form.reset();
          this.backtoList();
          this.isEditMode = false;
        } else {
          this.toaster.error(res.msg || 'Something went wrong!');
        }
      }, (err: any) => {
        this.toaster.error(err?.error?.msg || 'Server side error!');
      });
    } else {
      this.form.markAllAsTouched();
      this.toaster.error('Please fill all required fields!');
    }
  }

  delete(id: any) {
    this.dataService.deleteDataC(`deleteVisitorCardById/${id}`).subscribe((res: any) => {
      if (res.code === 100) {
        this.toaster.success(res.msg || 'Data deleted successfully!');
        this.getallData();
      } else if (res.code === 500) {
        this.toaster.error('Internal Server Error!');
      } else {
        this.toaster.error('Something went wrong!');
      }
    }, (err: any) => {
      const errorMessage = err?.error?.message || 'Something went wrong!';
      this.toaster.error(errorMessage);
    });
  }

  addnew(): void {
    this.showFormData = true;
    this.showTableData = false;
    this.form.reset();
    this.isEditMode = false;
  }

  backtoList(): void {
    this.showFormData = false;
    this.showTableData = true;
    this.isEditMode = false;
  }

  applyPagination(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.dataSource.data = this.filterallData.slice(start, end);
    this.pageStart = this.totalItems ? start + 1 : 0;
    this.pageEnd = Math.min(end, this.totalItems);
  }

  applyFilter(event: any): void {
    const value = (event.target.value || '').trim().toLowerCase();
    const filtered = this.getAllList.filter((item: any) =>
      item.visitorCardNumber.toLowerCase().includes(value)
    );
    this.filterallData = filtered;
    this.totalItems = this.filterallData.length;
    this.pageIndex = 0;
    this.applyPagination();
  }

  onCancel(): void {
    this.form.reset();
    this.isEditMode = false;
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
