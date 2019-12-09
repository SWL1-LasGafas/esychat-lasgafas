import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PersonService } from '../person.service';
import { ChatserverService } from '../chatserver.service';
import { Message } from '../message'

@Component({
  selector: 'app-chat-bar',
  templateUrl: './chat-bar.component.html',
  styleUrls: ['./chat-bar.component.css']
})
export class ChatBarComponent implements OnInit {

  constructor(public pService: PersonService, public chatService: ChatserverService) { }

  chatText:string = ''; // Enthält nur die Message aus dem Feld
  chatMsgObj:Message = new Message(); // Enthält nickname und message (kein date! Das macht der Server dann!)
  nickName:string = "";
  isOK:boolean=false;

  ngOnInit() {
  }

  checkMsg(value:string):boolean {
    console.log("checking "+value);
    if (value.length>0)
    {
      this.isOK=true;
    }
    else
    {
      this.isOK=false;
    }
    return this.isOK;
  }

  get chatMessage(): Message {
    return this.chatMsgObj;
  }
  
  @Output()
  chatMessageChange = new EventEmitter<Message>();

  @Input()
  set chatMessage(msgObj:Message) {

    //if (this.checkMsg(msgObj.message)) // Nochmals Prüfung der Chat-Message. Vermutlich völlig überflüssig (gup)
    {
      this.chatMessageChange.emit(msgObj);
    }
    /* else {
      console.log("Chat-Message ungültig!");
    } */
  }

  checkNick() {
    this.nickName = this.pService.myNickname;
  }

  // Diese Funktion hängt führende Nullen an. Mit Berücksichtigung Vorzeichen // wandert in chat-history
  // adaptiert von https://gist.github.com/endel/321925f6cafa25bbfbde
  pad = function(val:any,size:number):string {
    var sign = Math.sign(val) === -1 ? '-' : '';
    return sign + new Array(size).concat([Math.abs(val)]).join('0').slice(-size);
  }

  sendChat() {
    
    if (this.checkMsg(this.chatText.trim())) // Falls überhaupt etwas drin steht, natürlich
    {
      // Hier wird neu mit dem Message Objekt gearbeitet
      this.chatMsgObj.nickname = this.pService.myNickname;
      this.chatMsgObj.message = this.chatText.trim();
      this.chatMessage = this.chatMsgObj;

      // chat-history hatte Probleme, die Beiträge zu senden. Deshalb wird der REST-Service jetzt doch schon hier angesprochen.
      if (this.chatMsgObj) { // Es gibt leere Einträge auf dem Chatserver. Das lässt darauf schliessen, dass POST-Requests mit leerem Zeug kommen.
        console.log('Start schreiben History...');
        this.chatService.addToHistory(this.chatMsgObj).subscribe( 
          (response: Message) => {
            console.log('History add: ' + response.message);
          }
        )
        console.log('Ende schreiben History...');
      }
  
    }
    this.chatText = '';
  }

}
