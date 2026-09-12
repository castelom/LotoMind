export class Contest {
  constructor({
    number,
    date,
    numbers,
    drawOrder,
    previousContest,
    nextContest,
    isSpecialContest
  }) {
    this.number = number;
    this.date = date;
    this.numbers = numbers;
    this.drawOrder = drawOrder;
    this.previousContest = previousContest;
    this.nextContest = nextContest;
    this.isSpecialContest = isSpecialContest;
  }
}