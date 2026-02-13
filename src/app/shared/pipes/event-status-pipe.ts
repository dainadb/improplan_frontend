import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'eventStatus'
})
export class EventStatusPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
