import { Component, DoCheck, Input, Output, EventEmitter, OnInit } from '@angular/core';
//import { AppComponent } from '../app.component';
import { ConfigurationService } from '../configuration.service';
import { PersonService } from '../person.service';
import { NicklistService } from '../nicklist.service';
import { ChatserverService } from '../chatserver.service';
import { Message } from '../message'
import { Nickname } from '../nickname'
import { stringify } from 'querystring'; // Wohl jetzt überflüssig, weil nicht mehr mit <string> gearbeitet wird

@Component({
  selector: 'app-chat-history',
  templateUrl: './chat-history.component.html',
  styleUrls: ['./chat-history.component.css']
})


export class ChatHistoryComponent implements DoCheck {

  constructor(public cService: ConfigurationService, public chatService: ChatserverService, public pService: PersonService, public nService: NicklistService ) { }

  ngOnInit() {
    setInterval(() => {
      this.getHistory();
      //this.scrollTop(); // Scrolling hier nützt nichts. In chat-history.component.html gelöst nach Lösung 3 Ch. Baumgarten. Hier mal deaktiviert.
    }, this.cService.historyPolling); // Polling
  }

  public content: string[] = [];
  public historyLength: number = this.cService.historyMaxLength; // Bezieht Infos aus dem Configuration Service
  newline: string = "\n";
  tstamp: string = '';
  nickName: string = "";
  color: string;
  public hashlist: string[] = [];
  msgCounter:number = 0; // Ungefährer Stand des Messagecounters. Könnte auch durch Durchzählen des lokalen Arrays ermittelt werden, aber wird jetzt mal durch chat-bar beim Speichern übergeben.

  // Nickname Objekte zusammenbauen
  nickObj:Nickname = new Nickname(); // Einzelnes Objekt
  public nickList:Nickname[] = []; // Array, das dann irgendwie in die main-Komponente rein muss

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
    console.log('Start lesen History mit counter='+this.msgCounter+'...');
    if (this.pService.myNickname) { // Lädt erst etwas, wenn es einen lokalen Nickname gibt
      // Die vom REST-Server zusammengebaute Information wird wieder heruntergezogen und weiterverarbeitet
      // this.content = []; // Der Server hat alle Infos und schickt sie wieder rüber. Derzeit zumindest. gup 
      this.chatService.getHistory(this.msgCounter).subscribe(
        (response: Message) => {
          console.log('History read response: ' + response);
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
              this.tstamp = dt.getDate() + '. ' + monthnames[dt.getMonth()] + ' ' + dt.getFullYear() + ', ' + this.pad(dt.getHours(), 2) + ':' + this.pad(dt.getMinutes(), 2) + ' Uhr'; //Hier wird das Datum formatiert. Layout nach Wunsch des Kunden (2. Dez 2019)

              // Hier findet die Montage des Textes statt.
              response[i].dateFormatted = this.tstamp; // Formatierten Timestamp übergeben

              if (this.nickName == this.pService.myNickname) {
                response[i].position = "right";
                response[i].color = nickClass[0]; // Die Standardfarbe für den eigenen Nickname
              }
              else if (response[i].nickname == '')
              {
                // Faktisch gar nichts machen. Es wird davon ausgegangen, dass das Systemmessages sind, die wir hier nicht verändern dürfen
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

              // Nickname-Liste zusammenbauen. Am Ende sollte jeder Nick nur einmal drin sein.
              if (response[i].nickname) { //Keine Systemmeldungen u.ä. mit einpflegen!
                var dt = new Date();
                var indx = this.nickList.findIndex(myObj => myObj.name == response[i].nickname); // prüfen, ob es den Nick schon gibt
                if (indx > -1) { // Nickname ist vorhanden. Nur updaten!
                  if (response[i].date > dt.getTime() - this.cService.nickTimeout) // Neuer als 30 Minuten
                  {
                    console.log('chat-history: Nickname ' + this.nickList[indx].name + ' ist aktiv.');
                    this.nickList[indx].active = true; // Aktiv setzen
                  }
                  else {
                    console.log('chat-history: Nickname ' + this.nickList[indx].name + ' ist inaktiv.');
                    this.nickList[indx].active = true; // Inaktiv setzen
                  }
                  console.log('chat-history: ' + this.nickList[indx].name + ' in Nickliste geändert.');
                }
                else { // Noch nicht vorhanden. Objekt erstellen und einfügen
                  this.nickObj = new Nickname(); // Initialisieren
                  this.nickObj.name = response[i].nickname;
                  if (response[i].date > dt.getTime() - this.cService.nickTimeout) // Neuer als 30 Minuten
                  {
                    console.log('chat-history: Nickname ' + this.nickObj.name + ' ist aktiv.');
                    this.nickObj.active = true; // Aktiv setzen, wenn Beitrag neuer als 30 min.
                  }
                  else {
                    console.log('chat-history: Nickname ' + this.nickObj.name + ' ist inaktiv.');
                    this.nickObj.active = false; // inaktiv setzen, wenn Beitrag älter als 30 min.
                  }
                  // this.nickObj.enterdate = response[i].date; // Der Wert ist ungenau, da er sich nur auf die im Array vorhandenen Beiträge bezieht und zudem das neuste Datum haben wird statt dem ältesten
                  console.log('chat-history: ' + this.nickObj.name + ' in Nickliste eingefügt.');
                  this.nickList.push(this.nickObj);
                }
              }
              else {
                console.log('chat-history: Systemmeldung o.ä. ohne Nickname');
              }
              
              // DEBUG
              // this.nickList.forEach(value => {console.log('chat-history Nickliste: ' + value.name + ' * ');});

              dt = null; // Versuch, ein Speicherloch zu verhindern. gup

              // Buchhaltung aufaddieren (Schleifenzähler und Counter)
              i++;
              this.msgCounter=response[i].counter;

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
          // Jetzt muss noch irgendwie die Nick-Liste rüber in die main-Komponente, um die aktuellen Nicknames zu ermitteln. Das ist jetzt ein Problem...
          // Nickliste in main-Komponente reinbekommen
          this.nickList.forEach(value => {console.log('chat-history Nickliste: ' + value.name + ' * ');});
          this.nickListChange.emit(this.nickList); // wahrscheinlich überflüssig. Schickt zwar die Daten, aber das Binding aktualisiert sie nie
          this.nService.setNicklist(this.nickList);
        }
      )
    }
    console.log('Ende lesen History...');
  }

  @Input()
  set chatHistory(chatMsgObj: Message) {
    console.log('chat-history: @Input starts. Empfange Counter ' + chatMsgObj.counter);
    this.msgCounter = chatMsgObj.counter; // In der Instanz speichern
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

  @Output()
  nickListChange = new EventEmitter<Nickname[]>();

  ngDoCheck() {
    this.scrollTop();  // Verhalten etwas suboptimal, weil es jetzt bei jedem einzelnen Tastendruck im Eingabefeld scrollt. Aber es scrollt, immerhin. Und es ist sogar ein Ergänzung zum CSS Scrolling
  }

}
