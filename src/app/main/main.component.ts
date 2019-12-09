import { Component, OnInit } from '@angular/core';
import { PersonService } from '../person.service';
import { ChatserverService } from '../chatserver.service';
import { Message } from '../message'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(public pService: PersonService, public chatService: ChatserverService) { }

  initialText: string = "...";
  messageText: string = "";
  historyText: string = "";
  nickName: string = "";
  nickSet: boolean = false;
  errorMsg: string = '';

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
        console.log('History add System Message: ' + response.message);
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
      }
      else if (this.pService.myOldNickname == this.pService.myNickname) { // Nur in diesem Fall braucht es eine Fehlermeldung
        console.log('Nickname-Change nicht gemeldet!');
        this.errorMsg = 'Neuer Nickname identisch mit altem Nickname. Nichts geändert!'; 
      }
      else {
        console.log('Erster Nickname überhaupt')
        this.errorMsg = '';
      }
      this.nickSet = true;
    }
    else {
      console.log('Invalid Nick detected! '+this.pService.nickInvalid);
      this.errorMsg = 'Nickname ungültig. Bitte auch Buchstaben verwenden! Leerzeichen sind nicht erlaubt! Mindestens 4 Zeichen! Maximal 10 Zeichen!';  // systemMsg geht nicht, weil nicht davon ausgegangen werden kann, dass die chathistory überhaupt schon sichtbar ist.
    }
  }

  chatMsg(event: any): void {
    // console.log(<string>event.toUpperCase()); // Ausgeblendet, weil das die Konsole überfüllt
    this.historyText = <string>event;
    this.messageText = "";
  }

}