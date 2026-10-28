import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SharedModule } from '../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinner, NgxSpinnerModule } from 'ngx-spinner';
import { DataService } from '../../services/data-service';
import { StatustextPipe } from '../../shared/statustext-pipe';
import { Router } from '@angular/router';
import { RealTimeDashboard } from "../real-time-dashboard/real-time-dashboard";
export interface Device {
  id: number;
  serialNum: string;
  area: string;                 // matches your 'area' field
  deviceName: string;
  ipAddress: string;
  IoStatus: 'Online' | 'Offline';
  status: 'Active' | 'Inactive';
  lastActivity: string;         // you can change to Date if you parse it
  userCount: number;
  fingerPrintCount: number;
  faceCount: number;
  transactionCount: number;
  offlineSince: string | null;  // null when online / not applicable
  location?: string;
}


const DEVICE_DATA: any = [
 
];
@Component({
  selector: 'app-dashboard',
  imports: [SharedModule, CommonModule, NgxSpinnerModule,],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})


export class Dashboard {
  

  displayedColumns: string[] = [ 'srNo', 'id', 'serialNum',  'ipAddress', 'IoStatus', 'status', 'faceCount', 'transectionCount'];

  dataSource: any = new MatTableDataSource(DEVICE_DATA);
  dashbordCount:any;
  RoleName:any;
locationID:any;
getAllListlocation:any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(private dataService: DataService, private toaster: ToastrService, private router :Router) { }

  ngOnInit(): void {
      this.dataService.setTitle('Analytics Dashboard');
        this.locationID = sessionStorage.getItem('locationId');
    this.RoleName =  sessionStorage.getItem('roleName');

    this.getAllDeviceList();
    this.getDashbordcount();
    this.getPersonCountByLocation();
    this.getalllocation()
  }




   getalllocation(){

  let apiUrl = '';

  if (this.RoleName === 'Branch Admin' && this.locationID) {
    apiUrl = `findAllLocation?locationId=${this.locationID}`;
  } else {
    apiUrl = 'findAllLocation';
  }

  this.dataService.getAllData(apiUrl).subscribe((res: any) => {
      if(res.code === 100){
      this.getAllListlocation = res.extend.data;
       
      }else if(res.code===500){
                this.toaster.error('Internal server error !')
      }
      else{
        this.toaster.error('Something went wrong !')
      }
    }, )
  
  }
  
totalEmployee = 0;
presentEmployee = 0;
remainingEmployee = 0;

  getPersonCountByLocation(locationId?: any) {
    let apiUrl = 'getPersonCountByLocation';

    if (this.RoleName === 'Branch Admin' && this.locationID) {
      apiUrl += `?locationId=${this.locationID}`;
    } else if (this.RoleName === 'Admin' && locationId) {
      apiUrl += `?locationId=${locationId}`;
    }

    this.dataService.getAllData(apiUrl).subscribe((res: any) => {
    const count = res?.[0];

  this.totalEmployee = count?.userCount ?? 0;
  this.presentEmployee = count?.backup50Count ?? 0;
  this.remainingEmployee = this.totalEmployee - this.presentEmployee;
    });
  }

getBranchId(event: any) {
  const branchId = event.target.value;

  // Admin + Branch selected
  if (this.RoleName === 'Admin' && branchId) {
    this.getAllDeviceList(branchId);
    this.getPersonCountByLocation(branchId);
  }

  // Admin + Select Branch
  if (this.RoleName === 'Admin' && !branchId) {
    this.getAllDeviceList();
    this.getPersonCountByLocation();
  }
}


getAllDeviceList(locationId?: any) {
  let apiUrl = '';

  // Branch Admin
  if (this.RoleName === 'Branch Admin' && this.locationID) {
    apiUrl = `getAllDeviceInfo?locationId=${this.locationID}`;
  }

  // Admin + selected branch
  else if (this.RoleName === 'Admin' && locationId) {
    apiUrl = `getAllDeviceInfo?locationId=${locationId}`;
  }

  // Admin + default All Devices
  else {
    apiUrl = 'getAllDeviceInfo';
  }

  this.dataService.getAllData(apiUrl).subscribe((res: any) => {

    const list = res || [];

    // Device list
    // Table data
    this.dataSource.data = list;

    // Paginator
    this.dataSource.paginator = this.paginator;

  });
}


 getDashbordcount(){
  let apiUrl = '';

  if (this.RoleName === 'Branch Admin' && this.locationID) {
    apiUrl = `dashboardTotalSummary?locationId=${this.locationID}`;
  } else {
    apiUrl = 'dashboardTotalSummary';
  }

  this.dataService.getAllData(apiUrl).subscribe((res: any) => {
   this.dashbordCount = res;
  })
 }
isRealtime: boolean = true;

toggleDashboard() {
  this.isRealtime = !this.isRealtime;
  
  if (this.isRealtime) {
    this.dataService.setTitle('Real time Dashboard');
  } else {
    this.dataService.setTitle('Analytics Dashboard');
  }
}
}
