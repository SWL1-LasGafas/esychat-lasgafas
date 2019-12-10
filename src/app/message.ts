export class Message {
    public nickname:string = '';
    public message:string = '';
    public date:string = ''; // Unix-Timestamp, vom Server gesetzt
    public hash:string = '';
    public counter:number = 0; // Message-Zähler vom Server
    // Ausfüllen lokal; nicht auf dem REST-Server
    public dateFormatted = ''; // Formatierter Datumsstring
    public color:string = ''; // nickname color
    public position:string = ''; // left, right
    public shownick:string = ''; // Nickname, der in der Anzeige erscheint. Story 8.1
}
