import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Header } from './header/header';
import { SharedModule } from '../shared/shared-module';
import { authGuard } from '../auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: Header,        // layout component
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../pages/real-time-dashboard/real-time-dashboard').then(m => m.RealTimeDashboard),
         canActivate:[authGuard]
      },
        {
        path: 'staff-management',
        loadComponent: () =>
          import('../pages/staff-management/staff-management').then(m => m.StaffManagement)
        , canActivate:[authGuard]
      }

      ,
        {
        path: 'smtp-credential',
        loadComponent: () =>
          import('../pages/system-settings/smtp-credential/smtp-credential').then(m => m.SmtpCredential)
        // ,canActivate:[authGuard]
      }
      ,
        {
        path: 'smtp-emailId',
        loadComponent: () =>
          import('../pages/system-settings/smtp-email-id/smtp-email-id').then(m => m.SmtpEmailId)
        // ,canActivate:[authGuard]
      }
      ,
        {
        path: 'device-management',
        loadComponent: () =>
          import('../pages/system-settings/device-management/device-management').then(m => m.DeviceManagement)
        , canActivate:[authGuard]
      },

        {
        path: 'role-master',
        loadComponent: () =>
          import('../pages/master/add-role/add-role').then(m => m.AddRole)
        // ,canActivate:[authGuard]
      },

          {
        path: 'transfer-face-details',
        loadComponent: () =>
          import('../pages/face-transfer-list/face-transfer-list').then(m => m.FaceTransferList)
        // ,canActivate:[authGuard]
      },

        {
        path: 'emp-transfer-data',
        loadComponent: () =>
          import('../pages/system-settings/employee-transfer-data/employee-transfer-data').then(m => m.EmployeeTransferData)
        , canActivate:[authGuard]
      }
      ,
        {
        path: 'authorized-device',
        loadComponent: () =>
          import('../pages/system-settings/authorized-device/authorized-device').then(m => m.AuthorizedDevice)
        // ,canActivate:[authGuard]
      },

      {
        path:'add-location',
        loadComponent:()=> import('../pages/master/add-location/add-location').then((m)=> m.AddLocation)
        , canActivate:[authGuard]
      },
        {
        path:'add-college',
        loadComponent:()=> import('../pages/master/add-college/add-college').then((m)=> m.AddCollege)
        , canActivate:[authGuard]
      },
        {
        path:'add-designation',
        loadComponent:()=> import('../pages/master/designation/designation').then((m)=> m.Designation)
        , canActivate:[authGuard]
      },
 {
        path:'add-working-hours',
        loadComponent:()=> import('../pages/master/working-hours/working-hours').then((m)=> m.WorkingHours)
        // ,canActivate:[authGuard]
      },


       {
        path:'add-company',
        loadComponent:()=> import('../pages/master/add-company/add-company').then((m)=> m.AddCompany)
        , canActivate:[authGuard]
      },
      
      {
        path:'add-department',
        loadComponent:()=> import('../pages/master/add-department/add-department').then((m)=>m.AddDepartment)
        // ,canActivate:[authGuard]
      },
      {
        path:'visitor-card-master',
        loadComponent:()=> import('../pages/master/visitor-card-master/visitor-card-master').then((m)=>m.VisitorCardMaster)
        // ,canActivate:[authGuard]
      },
      {
        path:'workPermit-card-master',
        loadComponent:()=> import('../pages/master/work-permit-card-master/work-permit-card-master').then((m)=>m.WorkPermitCardMaster)
        // ,canActivate:[authGuard]
      },

      {
        path:'add-group',
        loadComponent:()=> import('../pages/master/add-group/add-group').then((m)=> m.AddGroup)
        , canActivate:[authGuard]
      },

      {
        path:'add-category',
        loadComponent:()=> import('../pages/master/add-category/add-category').then((m)=> m.AddCategory)
        , canActivate:[authGuard]
      },
     {
        path:'add-contractor',
        loadComponent:()=> import('../pages/master/add-contractor/add-contractor').then((m)=> m.AddContractor)
        , canActivate:[authGuard]
     },

        {   
        path:'log-records',
        loadComponent:()=> import('../pages/attendence-management/log-records/log-records').then((m)=> m.LogRecords)
        // ,canActivate:[authGuard]
     },
     
        {   
        path:'download-log',
        loadComponent:()=> import('../pages/attendence-management/download-logs/download-logs').then((m)=> m.DownloadLogs)
        // ,canActivate:[authGuard]
     },

      {
        path:'attendance-report',
        loadComponent:()=> import('../pages/reports/attendance-report/attendance-report').then((m)=> m.AttendanceReport)
        , canActivate:[authGuard]
     },
      {
        path:'multiple-punches-report',
        loadComponent:()=> import('../pages/reports/multiple-punches-report/multiple-punches-report').then((m)=> m.MultiplePunchesReport)
        , canActivate:[authGuard]
     },

          {
        path:'contractor-wise-report',
        loadComponent:()=> import('../pages/reports/contractor-wise-report/contractor-wise-report').then((m)=> m.ContractorWiseReport)
        , canActivate:[authGuard]
     },

     {
      path:'master-report',
      loadComponent:()=> import('../pages/reports/master-report/master-report').then((m)=> m.MasterReport)
     },

     {
      path:'access-control-report',
      loadComponent:()=> import('../pages/reports/access-control-report/access-control-report').then((m)=> m.AccessControlReport)
     },

       {
      path:'access-granted-report',
      loadComponent:()=> import('../pages/reports/access-granted-report/access-granted-report').then((m)=> m.AccessGrantedReport)
     },

       {
      path:'audit-report',
      loadComponent:()=> import('../pages/reports/audit-report/audit-report').then((m)=> m.AuditReport)
     },

       {
      path:'log-report',
      loadComponent:()=> import('../pages/reports/log-report/log-report').then((m)=> m.LogReport)
     },

       {
      path:'entry-exit-status-report',
      loadComponent:()=> import('../pages/reports/entry-exit-status-report/entry-exit-status-report').then((m)=> m.EntryExitStatusReport)
     },
     
   {
      path:'person-tracking-report',
      loadComponent:()=> import('../pages/reports/person-tracking-report/person-tracking-report').then((m)=> m.PersonTrackingReport)
     },

       {
      path:'organization-unit',
      loadComponent:()=> import('../pages/add-organization-unit/add-organization-unit').then((m)=> m.AddOrganizationUnit)
     },

        {
      path:'person-tracking',
      loadComponent:()=> import('../pages/person-tracking/person-tracking').then((m)=> m.PersonTracking)
     },

     {
      path:'new-dashboard',
      loadComponent:()=> import('../pages/new-dashboard/new-dashboard').then((m)=> m.NewDashboard)
            , canActivate:[authGuard]

    },
     
       {
        path:'help',
        loadComponent:()=> import('../pages/helps/helps').then((m)=> m.Helps)
        // ,canActivate:[authGuard]
     },

     {
      path:'get-details',
      loadComponent:()=> import('../pages/get-details/get-details').then((m)=> m.GetDetails)
     },

     
     {
      path:'parent-componant',
      loadComponent:()=> import('../pages/parentcomponant/parentcomponant').then((m)=> m.Parentcomponant)
     },

 {
      path:'child-componant',
      loadComponent:()=> import('../pages/child-componant/child-componant').then((m)=> m.ChildComponant)
     },
     
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class LayoutModule { }
