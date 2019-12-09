import { Component, DoCheck, Input, OnInit } from '@angular/core';
//import { AppComponent } from '../app.component';
import { ConfigurationService } from '../configuration.service';
import { PersonService } from '../person.service';
import { ChatserverService } from '../chatserver.service';
import { Message } from '../message'
import { stringify } from 'querystring';

@Component({
  selector: 'app-chat-history',
  templateUrl: './chat-history.component.html',
  styleUrls: ['./chat-history.component.css']
})


export class ChatHistoryComponent implements DoCheck {

  constructor(public cService: ConfigurationService, public chatService: ChatserverService, public pService: PersonService, ) { }

  ngOnInit() {
    setInterval(() => {
      this.getHistory();
      this.scrollTop(); // Scrolling hier nützt nichts. In chat-history.component.html gelöst nach Lösung 3 Ch. Baumgarten.
    }, this.cService.historyPolling); // Polling
  }

  public content: string[] = [];
  public historyLength: number = this.cService.historyMaxLength; // Bezieht Infos aus dem Configuration Service
  newline: string = "\n";
  tstamp: string = '';
  nickName: string = "";
  color: string;
  public hashlist: string[] = [];

  scrollTop() {
    console.log("Scrolling down");
    document.getElementById("myForm").scrollTop = document.getElementById("myForm").scrollHeight; // möglicherweise wird die Funktion mit der anpassung in chat-history.component.html überflüssig
  }

  // Diese Funktion hängt führende Nullen an. Mit Berücksichtigung Vorzeichen
  // adaptiert von https://gist.github.com/endel/321925f6cafa25bbfbde
  pad = function (val: any, size: number): string {
    var sign = Math.sign(val) === -1 ? '-' : '';
    return sign + new Array(size).concat([Math.abs(val)]).join('0').slice(-size);
  }

  getHistory() {
    console.log('Start lesen History...');
    if (this.pService.myNickname) { // Lädt erst etwas, wenn es einen lokalen Nickname gibt
      // Die vom REST-Server zusammengebaute Information wird wieder heruntergezogen und weiterverarbeitet
      // this.content = []; // Der Server hat alle Infos und schickt sie wieder rüber. Derzeit zumindest. gup 
      this.chatService.getHistory().subscribe(
        (response: Message) => {
          console.log('REST server gave back ' + response);
          // Hier muss unser Array aus der Serverantwort zusammengebaut werden.

          var monthnames: string[] = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]; // wanderte in chat-history
          var nickClass: string[] = ['myNick', 'nick1', 'nick2', 'nick3', 'nick4', 'nick5', 'nick6', 'nick7', 'nick8', 'nick9', 'nick0'];
          var nickIndex: number = 1; // Evtl. kann aus dem Nickname eine Index-Nummer kalkuliert werden (Quersumme, Modulo o.ä.)

          // Test für die Funktion pad(). Könnte für automatisierte Tests verwendet werden.
          //console.log("Funktionstest pad: -5-->"+this.pad(-5,2)+" und 8-->"+this.pad(8,2));
          var i = 0;
          try {
            while (response[i].date) { // Das date wird vom Server gesetzt und sollte so bei jedem Beitrag vorhanden sein.
              console.log('Check history element ' + i);
              var dt = new Date(response[i].date); // Jedes Mal mit dem Datum des Beitrags initialisiert
              this.nickName = response[i].nickname;
              this.tstamp = this.pad(dt.getDate(), 1) + '. ' + monthnames[dt.getMonth()] + ' ' + dt.getFullYear() + ', ' + this.pad(dt.getHours(), 2) + ':' + this.pad(dt.getMinutes(), 2) + ' Uhr'; //Hier wird das Datum formatiert. Layout nach Wunsch des Kunden (2. Dez 2019)

              // Hier findet die Montage des Textes statt.
              response[i].date = this.tstamp; // Formatierten Timestamp übergeben

              if (this.nickName == this.pService.myNickname) {
                response[i].position = "right";
                response[i].color = nickClass[0]; // Die Standardfarbe für den eigenen Nickname
              }
              else if (response[i].nickname == '')
              {
                // Faktisch gar nichts machen. Es wird davon ausgegangen, dass das Systemmesseges sind, die wir hier nicht verändern
              }
              else {
                response[i].position = "left";
                response[i].color = nickClass[((response[i].nickname.charCodeAt(0)+response[i].nickname.charCodeAt(1)+response[i].nickname.charCodeAt(2)+response[i].nickname.charCodeAt(3)) % 10)+1]; // Hier wird aus den ersten 4 Zeichen mit modulo ein Index für die zuzuweisende Farbe gebildet.
              }

              // Ausblenden des Nicks, wenn der oben der gleiche ist
              if (i>0)
              {
                if (response[i-1].nickname != response[i].nickname) {
                  response[i].shownick = response[i].nickname;
                }
                else {
                  response[i].shownick = '';
                }
              }
              else {
                // Beim ersten Beitrag der Liste den Nick sowieso einblenden
                response[i].shownick = response[i].nickname;
              }

              if (!this.hashlist.find(element => element == response[i].hash)) { // prüft, ob es den md5-hash schon gibt
                console.log('hash ' + response[i].hash + ' neu. Post hinzugefügt.');
                this.hashlist.push(response[i].hash);
                //this.content.push('<span class="'+nickClass[nickIndex]+'"><strong>' + this.nickName + "</strong></span>" + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="tstamp"><small>' + this.tstamp + '</small></span>' + this.newline + '<span class="chatText">' + response[i].message + '</span>' + this.newline);
                this.content.push(response[i]);
              }
              dt = null; // Versuch, ein Speicherloch zu verhindern. gup
              i++;

              // Array auf definierten Wert kürzen
              if (this.content.length > this.historyLength) {
                console.log('History gekürzt von ' + this.content.length + ' auf ' + this.historyLength + ' Elemente')
                this.content.shift(); // Problem: Es muss evtl. viel mehr gekürzt werden, weil das Array viel länger ist. TODO! 
              }

            }
          }
          catch {
            // Eigentlich nur gebaut, um den Fehler wegen leerem date herauszubekommen gup
          }
        }
      )
    }
    console.log('Ende lesen History...');
  }

  @Input()
  set chatHistory(chatMsgObj: Message) {
    console.log('chat-history: @Input starts');
    /*
    // Der Mechanismus mit dem Input der Komponente wird grundsätzlich beibehalten. So wird schon mal jedes Mal dann die History aktuell, wenn der Anwender einen Beitrag schreibt
    // Hier wird der neue Beitrag auf den REST-Server hochgeladen
    if (chatMsgObj) { // Es gibt leere Einträge auf dem Chatserver. Das lässt darauf schliessen, dass POST-Requests mit leerem Zeug kommen.
      console.log('Start schreiben History...');
      this.chatService.addToHistory(chatMsgObj).subscribe( // Es schreibt bislang nur den ersten Eintrag, danach kommt nicht mehr viel in den REST-Server rein
        (response: Message) => {
          console.log('History add: ' + response.message);
        }
      )
      console.log('Ende schreiben History...');
    }
    */



  }

  ngDoCheck() {
    //this.scrollTop();  // Verhalten etwas suboptimal, weil es jetzt bei jedem einzelnen Tastendruck im Eingabefeld scrollt. Aber es scrollt, immerhin.
  }

}
