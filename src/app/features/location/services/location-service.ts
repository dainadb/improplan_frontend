import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CommunityResponse } from '../models/community-response';
import { ApiResponse } from '../../../core/models/api-response';
import { Observable } from 'rxjs';
import { ProvinceResponse } from '../models/province-response';
import { MunicipalityResponse } from '../models/municipality-response';

/**
 * Servicio de localización geográfica.
 * Responsabilidad única: consultar comunidades autónomas, provincias y municipios.
 * Son entidades de solo lectura: se cargan en BBDD previamente y no tienen CRUD desde la app.
 */
@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private readonly http = inject(HttpClient);

  private readonly COMMUNITIES_URL   = 'http://localhost:8080/api/communities';
  private readonly PROVINCES_URL     = 'http://localhost:8080/api/provinces';
  private readonly MUNICIPALITIES_URL = 'http://localhost:8080/api/municipalities';

  // COMUNIDADES AUTÓNOMAS

  /**
   * Obtiene la lista completa de comunidades autónomas.
   */
  getAllCommunities(): Observable<ApiResponse<CommunityResponse[]>> {
    return this.http.get<ApiResponse<CommunityResponse[]>>(this.COMMUNITIES_URL);
  }

  /**
   * Obtiene una comunidad autónoma por su ID.
   */
  getCommunityById(id: number): Observable<ApiResponse<CommunityResponse>> {
    return this.http.get<ApiResponse<CommunityResponse>>(`${this.COMMUNITIES_URL}/${id}`);
  }

  /**
   * Busca una comunidad autónoma por nombre (búsqueda parcial, case-insensitive).
   */
  getCommunityByName(name: string): Observable<ApiResponse<CommunityResponse>> {
    const params = new HttpParams().set('name', name);
    return this.http.get<ApiResponse<CommunityResponse>>(`${this.COMMUNITIES_URL}/by-name`, { params });
  }

  // PROVINCIAS

  /**
   * Obtiene las provincias que pertenecen a una comunidad autónoma.
   * Uso principal: cargar provincias al seleccionar una comunidad en un formulario.
   */
  getProvincesByCommunity(communityName: string): Observable<ApiResponse<ProvinceResponse[]>> {
    const params = new HttpParams().set('communityName', communityName);
    return this.http.get<ApiResponse<ProvinceResponse[]>>(`${this.PROVINCES_URL}/by-community`, { params });
  }

  /**
   * Obtiene una provincia por su ID.
   */
  getProvinceById(id: number): Observable<ApiResponse<ProvinceResponse>> {
    return this.http.get<ApiResponse<ProvinceResponse>>(`${this.PROVINCES_URL}/${id}`);
  }

  /**
   * Obtiene una provincia por su nombre (case-insensitive).
   */
  getProvinceByName(name: string): Observable<ApiResponse<ProvinceResponse>> {
    const params = new HttpParams().set('name', name);
    return this.http.get<ApiResponse<ProvinceResponse>>(`${this.PROVINCES_URL}/by-name`, { params });
  }

  // MUNICIPIOS

  /**
   * Obtiene un municipio por su ID.
   */
  getMunicipalityById(id: number): Observable<ApiResponse<MunicipalityResponse>> {
    return this.http.get<ApiResponse<MunicipalityResponse>>(`${this.MUNICIPALITIES_URL}/${id}`);
  }

  /**
   * Busca municipios cuyo nombre contiene el texto proporcionado.
   * Uso principal: autocompletado en formularios de búsqueda.
   */
  getMunicipalitiesByName(name: string): Observable<ApiResponse<MunicipalityResponse[]>> {
    const params = new HttpParams().set('name', name);
    return this.http.get<ApiResponse<MunicipalityResponse[]>>(`${this.MUNICIPALITIES_URL}/by-name`, { params });
  }

  /**
   * Obtiene los municipios de una provincia específica.
   * Uso principal: cargar municipios al seleccionar una provincia en un formulario.
   */
  getMunicipalitiesByProvince(provinceName: string): Observable<ApiResponse<MunicipalityResponse[]>> {
    const params = new HttpParams().set('provinceName', provinceName);
    return this.http.get<ApiResponse<MunicipalityResponse[]>>(`${this.MUNICIPALITIES_URL}/by-province`, { params });
  }
}