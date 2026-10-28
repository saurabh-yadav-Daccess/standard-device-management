import { Component, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Dashboard } from '../dashboard/dashboard';
import { DataService } from '../../services/data-service';
import { I } from '@angular/cdk/keycodes';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-real-time-dashboard',
  imports: [SharedModule, CommonModule, FormsModule,Dashboard ],
  templateUrl: './real-time-dashboard.html',
  styleUrl: './real-time-dashboard.scss',
})
export class RealTimeDashboard implements OnInit{

  isRealtime: boolean = true;

  toggleDashboard() {
    this.isRealtime = !this.isRealtime;
       this.dataService.setTitle('Real time Dashboard');
  }


 filterPunchingLog:any[] = [];
 filteralarmLogs:any[]= [];
 isEdit:boolean = false 
 totalCountLog:number = 0;
 totalCountAlarm:number = 0;
 private punchingLogInterval: any;
private alarmLogInterval: any;

punchingLogs:any = [];
alarmLogs:any = [] =[];
locationID:any;
RoleName:any;

constructor(private fb:FormBuilder, public dataService:DataService, private toaster:ToastrService){

}


ngOnInit(){
         this.locationID = sessionStorage.getItem('locationId');
    this.RoleName =  sessionStorage.getItem('roleName');
    console.log(this.locationID ,this.RoleName)
 this.getPunchinglog();
 this.getAlarmLogs()
 this.getallpunchlogdata()
this.dataService.setTitle('Real time Dashboard');
  // Every 5 seconds refresh punching logs
  this.punchingLogInterval = setInterval(() => {
    this.getPunchinglog();
    this.getallpunchlogdata();
  }, 4000);

  // Every 5 seconds refresh alarm logs
  this.alarmLogInterval = setInterval(() => {
    this.getAlarmLogs();
  }, 4000);
 


}
countShowOnlyIn:any[] = []

// getPunchinglog(){
//   let apiUrl = '';

//   if (this.RoleName === 'Branch Admin' && this.locationID) {
//     apiUrl = `todaysPunchLogs?locationId=${this.locationID}`;
//   } else {
//     apiUrl = 'todaysPunchLogs';
//   }

//   this.dataService.getAllData(apiUrl).subscribe((res: any) => {

//     if(res.code == 100){
//       console.log("Punching log", res)
//    this.punchingLogs = res.extend.todaysPunchLogs
//    // Only IN status records
// this.filterPunchingLog = [...this.punchingLogs]
// this.currentPage = 1;
// this.updatePagination();

// this.countShowOnlyIn = this.punchingLogs.filter(
//   (item: any) => item.ioStatus === 'IN'
// );

// // Count of only IN records
// this.totalCountLog = this.countShowOnlyIn.length;
//     }else if(res.code == 200){
//       // this.toaster.error(res.msg || "Data not found today...!")
//     }
    
//     else if(res.code == 500){
//       this.toaster.error(res.msg || 'Internal server error... !')
//     }else{
//       this.toaster.error("Something went wrong...!")
//     }
//   })

// }
todayspunchlogdata:any[]=[]
getallpunchlogdata(){
  this.dataService.getAllData('todaysPunchLogsByLocation').subscribe({
    next: (res: any) => {
      if (res.code === 100) {
        let locations = res?.extend?.locationPunchLogs ?? [];


        this.todayspunchlogdata = locations.map((loc: any) => ({
          locationId: loc.locationId,
          locationName: loc.locationName,
          totalCount: loc.totalCount ?? 0
        }));
      }
      else if (res.code === 200) {
        this.todayspunchlogdata = [];
      }
      else if (res.code === 500) {
        this.toaster.error('Internal server error !');
      }
      else {
        this.toaster.error('Something went wrong !');
      }
    },
    error: (err) => {
      this.toaster.error(err.error?.msg || 'Failed to load branch wise punch logs!');
    }
  });
}

getPunchinglog() {
  let apiUrl = '';

  if (this.RoleName === 'Branch Admin' && this.locationID) {
    apiUrl = `todaysPunchLogs?locationId=${this.locationID}`;
  } else {
    apiUrl = 'todaysPunchLogs';
  }

  this.dataService.getAllData(apiUrl).subscribe((res: any) => {

    if (res.code == 100) {

      console.log("Punching log", res);

      // Safe handling
      this.punchingLogs = res?.extend?.todaysPunchLogs ?? [];

      // Only IN status records
      this.filterPunchingLog = [...this.punchingLogs];

      this.currentPage = 1;
      this.updatePagination();

      // Count only IN records
      this.countShowOnlyIn = this.punchingLogs.filter(
        (item: any) => item.ioStatus === 'IN'
      );

      this.totalCountLog = this.countShowOnlyIn.length;

    } 
    else if (res.code == 200) {

      // No punch records found
      this.punchingLogs = [];

      this.filterPunchingLog = [];

      this.countShowOnlyIn = [];

      this.totalCountLog = 0;

      this.currentPage = 1;
      this.updatePagination();

      // this.toaster.error(res.msg || "Data not found today...!");

    } 
    else if (res.code == 500) {

      this.toaster.error(
        res.msg || 'Internal server error... !'
      );

    } 
    else {

      this.toaster.error("Something went wrong...!");

    }
  });
}


// getAlarmLogs(){
        
//   let apiUrl = '';

//   if (this.RoleName === 'Branch Admin' && this.locationID) {
//     apiUrl = `todaysAlarmLogs?locationId=${this.locationID}`;
//   } else {
//     apiUrl = 'todaysAlarmLogs';
//   }

//   this.dataService.getAllData(apiUrl).subscribe((res: any) => {
//     if(res.code == 100){
//       console.log("Punching log", res)
 
//    this.alarmLogs = res.extend.todaysAlarmLogs
//    console.log("alram", this.alarmLogs)
//      this.filteralarmLogs = this.alarmLogs;
//      this.totalCountAlarm = this.filteralarmLogs?.length;
//      this.alarmCurrentPage = 1;
// this.updateAlarmPagination();
//     }else if(res.code == 200){
//       // this.toaster.error(res.msg || "Data not found today...!")
//     }
    
//     else if(res.code == 500){
//       this.toaster.error(res.msg || 'Internal server error... !')
//     }else{
//       this.toaster.error("Something went wrong...!")
//     }
//   })

// }


getAlarmLogs() {

  let apiUrl = '';

  if (this.RoleName === 'Branch Admin' && this.locationID) {
    apiUrl = `todaysAlarmLogs?locationId=${this.locationID}`;
  } else {
    apiUrl = 'todaysAlarmLogs';
  }

  this.dataService.getAllData(apiUrl).subscribe((res: any) => {

    if (res.code == 100) {

      console.log("Alarm log", res);

      // Safe handling
      this.alarmLogs = res?.extend?.todaysAlarmLogs ?? [];

      console.log("alarm", this.alarmLogs);

      this.filteralarmLogs = [...this.alarmLogs];

      this.totalCountAlarm = this.filteralarmLogs.length;

      this.alarmCurrentPage = 1;

      this.updateAlarmPagination();

    } 
    else if (res.code == 200) {

      // No alarm records found
      this.alarmLogs = [];

      this.filteralarmLogs = [];

      this.totalCountAlarm = 0;

      this.alarmCurrentPage = 1;

      this.updateAlarmPagination();

      // this.toaster.error(res.msg || "Data not found today...!");

    } 
    else if (res.code == 500) {

      this.toaster.error(
        res.msg || 'Internal server error... !'
      );

    } 
    else {

      this.toaster.error("Something went wrong...!");

    }
  });
}




filterDatapunchingLog(event: any) {
  const value = (event.target.value || '').trim().toLowerCase();

  if (!value) {
    this.filterPunchingLog = [...this.punchingLogs];
  } else {
    this.filterPunchingLog = this.punchingLogs.filter((item: any) =>
      (item.name || '').toLowerCase().includes(value)
    );
  }

  this.currentPage = 1;
  this.updatePagination();
}


filterDatAlaram(event: any) {
  const value = (event.target.value || '').trim().toLowerCase();

  if (!value) {
    this.filteralarmLogs = [...this.alarmLogs];
  } else {
    this.filteralarmLogs = this.alarmLogs.filter((item: any) =>
      (item.name || '').toLowerCase().includes(value)
    );
  }

  this.alarmCurrentPage = 1;
  this.updateAlarmPagination();
}


// Punching Log Pagination
pagedPunchingLog: any[] = [];
currentPage = 1;
pageSize = 10;

get totalPages(): number {
  return Math.ceil(this.filterPunchingLog.length / this.pageSize);
}

get endRecord(): number {
  return Math.min(this.currentPage * this.pageSize, this.filterPunchingLog.length);
}

updatePagination() {
  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;
  this.pagedPunchingLog = this.filterPunchingLog.slice(start, end);
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.updatePagination();
  }
}

previousPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.updatePagination();
  }
}


// Alarm Log Pagination
pagedAlarmLogs: any[] = [];
alarmCurrentPage = 1;
alarmPageSize = 10;

get alarmTotalPages(): number {
  return Math.ceil(this.filteralarmLogs.length / this.alarmPageSize);
}

get alarmEndRecord(): number {
  return Math.min(
    this.alarmCurrentPage * this.alarmPageSize,
    this.filteralarmLogs.length
  );
}




updateAlarmPagination() {
  const start = (this.alarmCurrentPage - 1) * this.alarmPageSize;
  const end = start + this.alarmPageSize;
  this.pagedAlarmLogs = this.filteralarmLogs.slice(start, end);
}

nextAlarmPage() {
  if (this.alarmCurrentPage < this.alarmTotalPages) {
    this.alarmCurrentPage++;
    this.updateAlarmPagination();
  }
}

previousAlarmPage() {
  if (this.alarmCurrentPage > 1) {
    this.alarmCurrentPage--;
    this.updateAlarmPagination();
  }
}


ngOnDestroy(): void {

  if (this.punchingLogInterval) {
    clearInterval(this.punchingLogInterval);
    this.punchingLogInterval = null;
  }

  if (this.alarmLogInterval) {
    clearInterval(this.alarmLogInterval);
    this.alarmLogInterval = null;
  }
}


}
