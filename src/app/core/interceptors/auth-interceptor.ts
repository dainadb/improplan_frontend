import { HttpInterceptorFn } from '@angular/common/http';
/**
 * Interceptor de autenticación para agregar el encabezado Authorization a las solicitudes HTTP.
 * @param req La solicitud HTTP entrante.
 * @param next El siguiente interceptor en la cadena.
 * @returns La solicitud HTTP modificada o la original si no se requiere autenticación.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
 // NO tocar las llamadas de login/register. Devuelven la ruta original sin cabeceras
    if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
      return next(req);
    }

    // Se obtiene el item que se ha guardado en el login 'basicAuth'
    const basic = localStorage.getItem('basicAuth');
    if (basic) {
      // Si existe, clonamos la llamada/url y se lo añadimos en las cabeceras
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Basic ${basic}` //Esto nos permitirá acceder a las rutas que estén capadas en el SpringSecurityConfig.java
        }
      });
      return next(authReq);
    }

    // Si no hay credenciales, pasa la petición tal cual
    return next(req);
};
