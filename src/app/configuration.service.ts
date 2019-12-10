import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor() { }
  
  historyMaxLength:number=50;
  historyPolling:number=2000; // Neuladen der Chat-History in ms
  nickTimeout:number=1800000; // Zeitraum in ms, in dem ein Nick geschrieben haben muss, um als aktiv zu gelten. 30 Minuten

  public getHistoryMaxLength():number {
    return this.historyMaxLength;
  }

  public getHistoryPolling():number {
    return this.historyPolling;
  }

  public getNickTimeout():number {
    return this.nickTimeout;
  }

}
