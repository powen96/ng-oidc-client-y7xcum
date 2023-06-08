import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { ActionReducerMap, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { NgOidcClientModule, Config } from 'ng-oidc-client';
import { AppComponent } from './core/components/app/app.component';
import { HomeComponent } from './core/components/home/home.component';
import { OidcGuardService } from './core/providers/oidc-guard.service';
import { ProtectedComponent } from './core/components/protected/protected.component';
import { LoginComponent } from './core/components/login/login.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { OidcInterceptorService } from './core/providers/oidc-interceptor.service';
import { UserModule } from './modules/user/user.module';
import { WebStorageStateStore, Log } from 'oidc-client';
import { MaterialModule } from './material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UnauthorizedComponent } from './core/components/unauthorized/unauthorized.component';

export interface State {
  router: RouterReducerState;
}

export const rootStore: ActionReducerMap<State> = {
  router: routerReducer
};

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  },
  {
    path: 'protected',
    canActivate: [OidcGuardService],
    component: ProtectedComponent
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [AppComponent, ProtectedComponent, HomeComponent, LoginComponent, UnauthorizedComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    StoreModule.forRoot(rootStore),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
      name: 'ng-oidc-client',
      logOnly: true
    }),
    NgOidcClientModule.forRoot({
      oidc_config: {
        authority: 'https://ng-oidc-client.azurewebsites.net',
        client_id: 'ng-oidc-client-identity',
        redirect_uri: 'https://ng-oidc-client.stackblitz.io/callback.html',
        response_type: 'id_token token',
        scope: 'openid profile offline_access api1',
        post_logout_redirect_uri: 'https://ng-oidc-client.stackblitz.io/signout-callback.html',
        silent_redirect_uri: 'https://ng-oidc-client.stackblitz.io/renew-callback.html',
        accessTokenExpiringNotificationTime: 10,
        automaticSilentRenew: true,
        userStore: new WebStorageStateStore({ store: window.localStorage })
      },
      log: {
        logger: console,
        level: Log.DEBUG
      }
    }),
    UserModule.forRoot({
      urls: {
        api: 'https://ng-oidc-client.azurewebsites.net'
      }
    }),
    MaterialModule
  ],
  providers: [
    OidcGuardService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: OidcInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
