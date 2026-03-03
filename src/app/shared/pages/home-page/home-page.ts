import { Component } from '@angular/core';
import { LocationFilterComponent } from "../../../features/location/components/location-selector/location-filter";

@Component({
  selector: 'app-home-page',
  imports: [LocationFilterComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
 
})
export class HomePage {

}
