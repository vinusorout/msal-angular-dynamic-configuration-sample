import { InjectionToken, NgModule, APP_INITIALIZER } from '@angular/core';
import { IPublicClientApplication, PublicClientApplication, 
    InteractionType, BrowserCacheLocation, LogLevel } from '@azure/msal-browser';
import { MsalGuard, MsalInterceptor, MsalBroadcastService,
     MsalInterceptorConfiguration, MsalModule, MsalService,
      MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, 
      MsalGuardConfiguration, MsalRedirectComponent } from '@azure/msal-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ConfigService } from './config.service';

const AUTH_CONFIG_URL_TOKEN = new InjectionToken<string>('AUTH_CONFIG_URL');

export function initializerFactory(env: ConfigService, configUrl: string): any {
    // APP_INITIALIZER, except a function return which will return a promise
    // APP_INITIALIZER, angular doesnt starts application untill it completes
    const promise = env.init(configUrl).then((value) => {
        console.log('finished getting configurations dynamically.');
    });
    return () => promise;
}

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1; // Remove this line to use Angular Universal

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}
export function MSALInstanceFactory(config: ConfigService): IPublicClientApplication {
  return new PublicClientApplication({
    auth: config.getSettings('msal').auth,
    cache: config.getSettings('msal').cache,
    system: {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALInterceptorConfigFactory(config: ConfigService): MsalInterceptorConfiguration {
    const protectedResourceMap = new Map<string, Array<string>>(config.getSettings('interceptor').protectedResourceMap)
  
    return {
      interactionType: config.getSettings('interceptor').interactionType,
      protectedResourceMap
    };
  }
  
  export function MSALGuardConfigFactory(config: ConfigService): MsalGuardConfiguration {
    return { 
      interactionType: config.getSettings('guard').interactionType,
      authRequest: config.getSettings('guard').authRequest,
      loginFailedRoute: config.getSettings('guard').loginFailedRoute
    };
  }

@NgModule({
    providers: [
    ],
    imports: [MsalModule]
})
export class MsalConfigDynamicModule {

    static forRoot(configFile: string) {
        return {
            ngModule: MsalConfigDynamicModule,
            providers: [
                ConfigService,
                { provide: AUTH_CONFIG_URL_TOKEN, useValue: configFile },
                { provide: APP_INITIALIZER, useFactory: initializerFactory,
                     deps: [ConfigService, AUTH_CONFIG_URL_TOKEN], multi: true },
                {
                    provide: MSAL_INSTANCE,
                    useFactory: MSALInstanceFactory,
                    deps: [ConfigService]
                },
                {
                    provide: MSAL_GUARD_CONFIG,
                    useFactory: MSALGuardConfigFactory,
                    deps: [ConfigService]
                },
                {
                    provide: MSAL_INTERCEPTOR_CONFIG,
                    useFactory: MSALInterceptorConfigFactory,
                    deps: [ConfigService]
                },
                MsalService,
                MsalGuard,
                MsalBroadcastService,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: MsalInterceptor,
                    multi: true
                }
            ]
        };
    }
}