export class StatusDisplay {
    constructor(players) {
        this.players = players;
    }

    draw(s) {
        // Identify players who haven't voted yet
        let notVotedPlayers = this.players.filter(player => !player.hasVoted);
        let notVotedText = notVotedPlayers.map(player => player.id).join(', ');

        // Draw the status text
        s.fill(255);
        s.textSize(16);
        s.textAlign(s.CENTER, s.BOTTOM);
        s.text(`Waiting for: ${notVotedText}`, s.width / 2, s.height - 10);
    }
}