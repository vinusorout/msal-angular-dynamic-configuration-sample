# MSAL Angular 2.x Dynamic configurations using Factory Providers and APP_INITIALIZER

This is an updated version of sample provided by the MSAL Angular 2.x at [MSAL Angular Samples](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/samples/msal-angular-v2-samples)

In this sample I used the MSAL library **Factory providers** with **APP_INITIALIZER** to load the configurations dynamically using a HttpClient service. As we use MsalInterceptor in app module, this makes angular to load MsalService and other component used by Msalinterceptor load before APP_INITIALIZER, while calling any API usig HttpClient, but for getting config values we should bypass this. So, for this we can use HttpBackend handler, and then can create local instance of HttpClient in config service constructor. [Check config serive](src/app/msal-config-dynamic-module/config.service.ts)

As per the doc provided with this library, they asked to use **platformBrowserDynamic** for this, [check here](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/configuration.md), but this doesnt seems a valid solution, as Angular alredy have implemented a solution to configure the app before initialization using APP_INITIALIZER.
