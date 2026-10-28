import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data-service';
import { ToastrService } from 'ngx-toastr';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-monthly-work-report',
  imports: [CommonModule, SharedModule, FormsModule, NgSelectModule],
  templateUrl: './monthly-work-report.html',
  styleUrl: './monthly-work-report.scss',
})
export class MonthlyWorkReport {

  // Default range: first day of current month to today
  fromDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  toDate: Date = new Date();
  now: Date = new Date();

  maxDate: string = new Date().toISOString().split('T')[0];

  reportData: any[] = [];

  constructor(private dataService: DataService, private toaster: ToastrService) {

  }

  locationID: any;
  RoleName: any;
  locationName: any;

  ngOnInit(): void {
    this.locationID = sessionStorage.getItem('locationId');
    this.RoleName = sessionStorage.getItem('roleName');
    this.locationName = sessionStorage.getItem('locationName');
    this.getallData();
    this.getallDataLocations();
  }

  getAllList: any[] = []

  formatDateToYMD(date: Date | null): string | undefined {
    if (!date) return undefined;

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  exportPdfFromSelectedRange(): void {
    const fromDate = this.formatDateToYMD(this.fromDate) ?? undefined;
    const toDate = this.formatDateToYMD(this.toDate) ?? undefined;

    this.onExportPdfFromJson(
      this.reportData,
      fromDate,
      toDate,
      this.selectedCategoryNames.join(',')
    );
  }

  // Selected IDs
  selectedCategoryIds: string[] = [];

  getallData() {
    this.dataService.getAllData('getAllCategory').subscribe({
      next: (res: any) => {
        if (res.code === 100) {
          this.getAllList = (res.extend.allCategory || []).filter((item: any) => item.categoryName !== 'Student');
        }
        else if (res.code === 500) {
          this.toaster.error('Internal server error!');
        }
        else {
          this.toaster.error('Something went wrong!');
        }
      },
      error: (err) => {
        this.toaster.error(err.error?.msg || 'Failed to load category list!');
      }
    });
  }

  selectedCategoryNames: string[] = [];
  updateSelectedCategoryNames() {
    this.selectedCategoryNames = this.getAllList
      .filter(item => this.selectedCategoryIds.includes(item.categoryId))
      .map(item => item.categoryName);
  }

  // Select All
  toggleSelectAllCategory() {
    if (this.isAllCategorySelected()) {
      this.selectedCategoryIds = [];
    } else {
      this.selectedCategoryIds = this.getAllList.map(
        (x: any) => x.categoryId
      );
    }
    this.updateSelectedCategoryNames();
  }

  // Check All Selected
  isAllCategorySelected(): boolean {
    this.updateSelectedCategoryNames();

    return (
      this.getAllList.length > 0 &&
      this.selectedCategoryIds.length === this.getAllList.length
    );
  }

  // Location List
  locationLists: any[] = []
  selectedLocationIds: any;

  getallDataLocations() {
    let apiUrl = '';

    if (this.RoleName === 'Branch Admin' && this.locationID) {
      apiUrl = `findAllLocation?locationId=${this.locationID}`;
    } else {
      apiUrl = 'findAllLocation';
    }

    this.dataService.getAllData(apiUrl).subscribe(
      (res: any) => {
        if (res.code === 100) {
          this.locationLists = res.extend.data;
        } else if (res.code === 500) {
          this.toaster.error('Internal server error!');
        } else {
          this.toaster.error('Something went wrong!');
        }
      },
      (err) => {
        // this.toaster.error(err.error.msg || 'Failed to load location list!');
      }
    );
  }

  getSelectedLocationName() {
    if (this.RoleName === 'Branch Admin') {
      return this.locationName || '';
    }

    return this.locationLists.find(
      (x: any) => x.locationId === this.selectedLocationIds
    )?.locationName || '';
  }

  totalworkinghours: any = '00:00';
  MonthlyWorkReport() {

    this.reportData = [];

    // Branch Mandatory
    if (this.RoleName !== 'Branch Admin' && this.selectedLocationIds == null) {
      this.toaster.error('Please select a Branch');
      return;
    }

    if (!this.selectedCategoryIds || this.selectedCategoryIds.length === 0) {
      this.toaster.error('Please select one category...!');
      return;
    }

    const fromDate = this.formatDateToYMD(this.fromDate);
    const toDate = this.formatDateToYMD(this.toDate);
    const categoryIds = this.selectedCategoryIds.join(',');
    const locationId =
      this.RoleName === 'Branch Admin'
        ? this.locationID
        : this.selectedLocationIds;

    const apiUrl = `monthlyWorkLoadReport?fromDate=${fromDate}&toDate=${toDate}&categoryIds=${categoryIds}&locationIds=${locationId}`;

    this.now = new Date();

    this.dataService.getAllData(apiUrl).subscribe({
      next: (res: any) => {
        // API may return the list directly, or wrapped as { code, extend: { ...list } }
        if (Array.isArray(res)) {
          this.reportData = res;
          this.totalworkinghours=this.reportData[0].totalWorkingHours
        } else if (res.code === 100) {
          this.reportData = Object.values(res.extend || {}).find(Array.isArray) as any[] || [];
        } else if (res.code === 200) {
          this.toaster.error(res.msg);
          this.reportData = [];
        }

        if (this.reportData.length === 0) {
          this.toaster.error('No data found');
        }
      },
      error: (err) => {
        this.toaster.error(err.error?.msg || 'Server Error');
      }
    });
  }

  onExportExcel(): void {

    if (!this.reportData || this.reportData.length === 0) {
      this.toaster.error('No data available for export');
      return;
    }

    const branchName = this.getSelectedLocationName() || 'All';
    const fDate = this.fromDate
      ? `${this.fromDate.getDate().toString().padStart(2, '0')} ${this.fromDate.toLocaleString('en-US', { month: 'short' })}, ${this.fromDate.getFullYear()}`
      : 'N/A';
    const tDate = this.toDate
      ? `${this.toDate.getDate().toString().padStart(2, '0')} ${this.toDate.toLocaleString('en-US', { month: 'short' })}, ${this.toDate.getFullYear()}`
      : 'N/A';
    const reportDate = new Date();
    const amPm = reportDate.getHours() >= 12 ? 'PM' : 'AM';
    const reportTime = `${reportDate.getDate().toString().padStart(2, '0')} ${reportDate.toLocaleString('en-US', { month: 'short' })}, ${reportDate.getFullYear()} , ${reportDate.getHours() % 12 || 12}:${reportDate.getMinutes().toString().padStart(2, '0')} ${amPm}`;

    // Excel Data
    const excelData = this.reportData.map((item: any, index: number) => {
      return [
        index + 1,
        item.empId ?? '',
        item.employeeName ?? '',
        item.designation ?? '',
        item.locationName ?? '',
        item.entryCount ?? 0,
        item.exitCount ?? 0,
        item.totalCount ?? 0,
        item.duplicateInCount ?? 0,
        item.duplicateOutCount ?? 0,
        item.duplicateTotalCount ?? 0,
        item.inCampusDuration ?? '',
        item.outCampusDuration ?? '',
        item.totalWorkingHours ?? ''
      ];
    });

    // Header Rows
    const headerRows = [
      [
        'Sr. No.',
        'Employee Id',
        'Employee Name',
        'Designation',
        'Branch Name',
        'Count',
        '',
        '',
        'Duplicates',
        '',
        '',
        'Working Duration (Hours)',
        '',
        'Total Working Hours'
      ],
      [
        '',
        '',
        '',
        '',
        '',
        'Entry',
        'Exits',
        'Total',
        'In',
        'Out',
        'Total',
        'In Campus',
        'Out Campus',
        ''
      ]
    ];

    // Combine Header + Data
    const sheetData = [
      [],
      [],
      [],
      [],
      ...headerRows,
      ...excelData
    ];

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Report Information
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [`Monthly Work Load Report`],
        [`From Date: ${fDate} to ${tDate}`],
        [
          `Branch Name: ${branchName}`,
          '', '', '', '', '', '', '', '', '', '',
          `Report Time: ${reportTime}`,
          '',
          ''
        ]
      ],
      { origin: 'A1' }
    );

    // =========================================================
    // MERGES
    // =========================================================
    worksheet['!merges'] = [

      // COUNT = F5:H5
      { s: { r: 4, c: 5 }, e: { r: 4, c: 7 } },

      // DUPLICATES = I5:K5
      { s: { r: 4, c: 8 }, e: { r: 4, c: 10 } },

      // WORKING DURATION = L5:M5
      { s: { r: 4, c: 11 }, e: { r: 4, c: 12 } },

      // Sr. No. = A5:A6
      { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } },

      // Employee Id = B5:B6
      { s: { r: 4, c: 1 }, e: { r: 5, c: 1 } },

      // Employee Name = C5:C6
      { s: { r: 4, c: 2 }, e: { r: 5, c: 2 } },

      // Designation = D5:D6
      { s: { r: 4, c: 3 }, e: { r: 5, c: 3 } },

      // Branch Name = E5:E6
      { s: { r: 4, c: 4 }, e: { r: 5, c: 4 } },

      // Total Working Hours = N5:N6
      { s: { r: 4, c: 13 }, e: { r: 5, c: 13 } },

      // Report Title = A1:N1
      { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } },

      // From Date = A2:N2
      { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } },

      // Branch Name = A3:K3
      { s: { r: 2, c: 0 }, e: { r: 2, c: 10 } },

      // Report Time = L3:N3
      { s: { r: 2, c: 11 }, e: { r: 2, c: 13 } }
    ];

    // Column Widths
    worksheet['!cols'] = [
      { wch: 8 },  // Sr. No.
      { wch: 16 }, // Employee Id
      { wch: 24 }, // Employee Name
      { wch: 18 }, // Designation
      { wch: 30 }, // Branch Name
      { wch: 10 }, // Entry
      { wch: 10 }, // Exits
      { wch: 10 }, // Total
      { wch: 10 }, // Duplicates IN
      { wch: 10 }, // Duplicates OUT
      { wch: 10 }, // Duplicates Total
      { wch: 16 }, // In Campus
      { wch: 16 }, // Out Campus
      { wch: 20 }  // Total Working Hours
    ];

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Work Load Report');

    XLSX.writeFile(workbook, 'Monthly_Work_Load_Report.xlsx');
  }

  onExportPdfFromJson(
    apiData: any[],
    fromDate?: string,
    toDate?: string,
    categoryName?: string
  ): void {

    if (!apiData || apiData.length === 0) {
      this.toaster.error('No data available to export');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const marginLeft = 5;
    const marginRight = 5;
    const marginBottom = 12;

    const firstPageTableStartY = 27;
    const otherPageTopMargin = 5;

    const availableWidth = pageWidth - marginLeft - marginRight;

    const formatHeaderDate = (value?: string): string => {
      if (!value) {
        return 'N/A';
      }

      const date = new Date(
        /^\d{4}-\d{2}-\d{2}$/.test(value)
          ? `${value}T00:00:00`
          : value
      );

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return `${date.getDate().toString().padStart(2, '0')} ${date.toLocaleString('en-US', { month: 'short' })}, ${date.getFullYear()}`;
    };

    const branchName = apiData[0]?.locationName || 'All';
    const fDate = formatHeaderDate(fromDate);
    const tDate = formatHeaderDate(toDate);
    const category = categoryName || 'All';

    const reportDate = new Date();
    const hours = reportDate.getHours();
    const minutes = reportDate.getMinutes().toString().padStart(2, '0');
    const amPm = hours >= 12 ? 'PM' : 'AM';

    const reportTime =
      `${reportDate.getDate().toString().padStart(2, '0')} ` +
      `${reportDate.toLocaleString('en-US', { month: 'short' })}, ` +
      `${reportDate.getFullYear()}, ` +
      `${hours % 12 || 12}:${minutes} ${amPm}`;

    const drawReportHeader = () => {

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Monthly Work Load Report', pageWidth / 2, 8, { align: 'center' });

      // Date
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`From Date: ${fDate} to ${tDate}`, pageWidth / 2, 13, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`Branch Name: ${branchName}`, marginLeft, 19);
      doc.text(`Report Time: ${reportTime}`, pageWidth - marginRight, 19, { align: 'right' });

      doc.setDrawColor(180, 180, 180);
      doc.line(marginLeft, 22, pageWidth - marginRight, 22);
    };

    const head = [
      [
        {
          content: `Category Name : ${category}`,
          colSpan: 14,
          styles: {
            halign: 'center',
            fontStyle: 'bold'
          }
        }
      ],
      [
        { content: 'SR. NO', rowSpan: 2 },
        { content: 'Employee Id', rowSpan: 2 },
        { content: 'Employee Name', rowSpan: 2 },
        { content: 'Designation', rowSpan: 2 },
        { content: 'Branch Name', rowSpan: 2 },
        { content: 'Count', colSpan: 3 },
        { content: 'Duplicates', colSpan: 3 },
        { content: 'Working Duration (Hours)', colSpan: 2 },
        { content: 'Total Working Hours', rowSpan: 2 }
      ],
      [
        { content: 'Entry' },
        { content: 'Exits' },
        { content: 'Total' },

        { content: 'In' },
        { content: 'Out' },
        { content: 'Total' },

        { content: 'In Campus' },
        { content: 'Out Campus' }
      ]
    ];

    const body = apiData.map(
      (item: any, index: number) => [
        index + 1,
        item.empId ?? '-',
        item.employeeName ?? '-',
        item.designation ?? '-',
        item.locationName ?? '-',
        item.entryCount ?? 0,
        item.exitCount ?? 0,
        item.totalCount ?? 0,
        item.duplicateInCount ?? 0,
        item.duplicateOutCount ?? 0,
        item.duplicateTotalCount ?? 0,
        item.inCampusDuration ?? '00:00',
        item.outCampusDuration ?? '00:00',
        item.totalWorkingHours ?? '00:00'
      ]
    );

    drawReportHeader();

    autoTable(doc, {
      head: head as any,
      body: body,
      startY: firstPageTableStartY,
      theme: 'grid',
      tableWidth: availableWidth,

      styles: {
        fontSize: 7,
        cellPadding: { top: 1.8, right: 1.2, bottom: 1.8, left: 1.2 },
        overflow: 'linebreak',
        valign: 'middle',
        halign: 'center',
        lineWidth: 0.15,
        lineColor: [190, 190, 190]
      },

      headStyles: {
        fillColor: [31, 134, 180],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.2,
        lineColor: [0, 100, 150]
      },

      // Total = 287mm (A4 landscape minus margins)
      columnStyles: {
        0: { cellWidth: 9 },
        1: { cellWidth: 17 },
        2: { cellWidth: 40, halign: 'left' },
        3: { cellWidth: 25, halign: 'left' },
        4: { cellWidth: 60, halign: 'left' },
        5: { cellWidth: 12 },
        6: { cellWidth: 12 },
        7: { cellWidth: 12 },
        8: { cellWidth: 12 },
        9: { cellWidth: 12 },
        10: { cellWidth: 12 },
        11: { cellWidth: 20 },
        12: { cellWidth: 20 },
        13: { cellWidth: 24 }
      },

      margin: {
        // Used for page 2 onwards
        top: otherPageTopMargin,
        left: marginLeft,
        right: marginRight,
        bottom: marginBottom
      },

      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      showHead: 'firstPage',

      didParseCell: (data: any) => {
        if (data.section === 'body' && [2, 3, 4].includes(data.column.index)) {
          data.cell.styles.halign = 'left';
        }
      },

      didDrawPage: () => {
        const currentPage = doc.getCurrentPageInfo().pageNumber;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(`Page ${currentPage}`, pageWidth - marginRight, pageHeight - 5, { align: 'right' });
      }
    });

    doc.save('Monthly_Work_Load_Report.pdf');
  }

}
