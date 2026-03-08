import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventResponse } from '../../models/event-response';

@Component({
  selector: 'app-event-map-popup',
  imports: [RouterLink],
  templateUrl: './event-map-popup.html',
  styleUrl: './event-map-popup.css',
})
export class EventMapPopup {

  readonly event = input.required<EventResponse>();
}
