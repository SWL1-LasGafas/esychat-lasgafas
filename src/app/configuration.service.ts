import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor() { }
  
  historyMaxLength:number=50;
  historyPolling:number=2000; // Neuladen der Chat-History in ms

  public getHistoryMaxLength():number {
    return this.historyMaxLength;
  }

  public getHistoryPolling():number {
    return this.historyPolling;
  }

}
