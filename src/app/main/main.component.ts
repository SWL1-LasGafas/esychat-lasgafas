import { Component, OnInit } from '@angular/core';
import { PersonService } from '../person.service';
import { ChatserverService } from '../chatserver.service';
import { Message } from '../message'
import { Nickname } from '../nickname'


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(public pService: PersonService, public chatService: ChatserverService) { }

  initialText: string = "...";
  messageText: string = "";
  msgObj: Message = new Message();
  nickName: string = "";
  nickSet: boolean = false;
  errorMsg: string = '';

  nickObj: Nickname = new Nickname();
  nickList: Nickname[] = [];

  ngOnInit() {
  }

  systemMsg(msg: string) {
    // Umstellung auf REST-Service. Meldung wird direkt an den Server geschickt.
    var sysMsg:Message= new Message();
    sysMsg.nickname='';
    sysMsg.message = msg; // Formatierungsanweisungen mitgeben haut nicht hin (gup)
    sysMsg.position = "sysmsg";
    this.chatService.addToHistory(sysMsg).subscribe(
      (response: Message) => {
        console.log('History add System Message: ' + response.message + ' mit counter=' + response.counter);
        // this.msgObj.counter = response.counter; // Counter aufsynchronisieren um Bandbreite sparen zu können
        // Das funktioniert nicht, ist aber auch kontraproduktiv. chat-history zieht sich ein Mal alles und synchronisiert sich danach selbst mit dem Counter. Wäre der Counter schon im @input würde es den gesendeten Beitrag gar nicht mehr runterziehen; es gäbe ein Loch
      }
    )
  }

  nickChange(event: any): void {
    console.log("Nickname Change");
    if (this.pService.nickInvalid < 1) { 
      if ((this.pService.myOldNickname) && (this.pService.myOldNickname != this.pService.myNickname)) { // Nur melden, wenn vorher ein Nickname gesetzt war und der anders war
        console.log("Nick gesetzt und OK!");
        this.systemMsg("** " + this.pService.myOldNickname + " ändert Nickname auf " + this.pService.myNickname + " **");
        this.errorMsg = '';

        console.log('Nickname-Objekt '+this.pService.myOldNickname+' geändert');

        // Ändert den Nickname in der Nick-Liste
        var dt=new Date();
        var indx=this.nickList.findIndex(myObj => myObj.name=this.pService.myOldNickname);
        this.nickList[indx].name=this.pService.myNickname;
      }
      else if (this.pService.myOldNickname == this.pService.myNickname) { // Nur in diesem Fall braucht es eine Fehlermeldung
        console.log('Nickname-Change nicht gemeldet!');
        this.errorMsg = 'Nickname identisch... keine Änderung'; 
      }
      else {
        console.log('Erster Nickname überhaupt');
        this.systemMsg("** " + this.pService.myNickname + " hat den Chat betreten! **");
        console.log('Nickname-Objekt '+this.pService.myNickname+' erstellt');
        // fügt den neuen Nick gleich mal in die Komponente nick-list ein
        var dt=new Date();
        this.nickObj.name=this.pService.myNickname;
        this.nickObj.enterdate=dt.getTime();
        this.nickObj.active=true;
        this.nickList.push(this.nickObj);

        //allfällige Fehlermeldungen löschen
        this.errorMsg = '';
      }
      this.nickSet = true;
    }
    else {
      console.log('Invalid Nick detected! '+this.pService.nickInvalid);
      this.errorMsg = 'Nickname ungültig. Bitte auch Buchstaben verwenden! Leerzeichen sind nicht erlaubt! Mindestens 4 Zeichen! Maximal 10 Zeichen!';  // systemMsg geht nicht, weil nicht davon ausgegangen werden kann, dass die chathistory überhaupt schon sichtbar ist.
    }
  }

  nickListSend(liste: Nickname []) {
    console.log('main: nickListChange aufgerufen!');
    this.nickList=liste;
    // DEBUG
    liste.forEach(value => {console.log(value.name + ' ist ' + value.active);}); 
  }

  chatMsg(event: any): void {
    if (event) // Unklar, wieso ein "undefined"-Objekt hier beim Start übergeben wird. Bringt aber auf jeden Fall nicht viel ausser Fehlermeldungen.
    {
      console.log('Übergebe Counter: ' + event.counter);
      this.msgObj = <Message>event;
    }
    //this.messageText = "";
  }

}