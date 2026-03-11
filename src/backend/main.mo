import Order "mo:core/Order";
import Array "mo:core/Array";
import List "mo:core/List";

actor {
  type Score = {
    playerName : Text;
    completionTime : Nat; // in seconds
    deaths : Nat;
  };

  module Score {
    public func compare(a : Score, b : Score) : Order.Order {
      Nat.compare(a.completionTime, b.completionTime);
    };
  };

  let scores = List.empty<Score>();

  public shared ({ caller }) func submitScore(playerName : Text, completionTime : Nat, deaths : Nat) : async () {
    let newScore : Score = {
      playerName;
      completionTime;
      deaths;
    };
    scores.add(newScore);
  };

  public query ({ caller }) func getTopScores() : async [Score] {
    let allScores = scores.toArray();
    allScores.sort().sliceToArray(0, if (allScores.size() < 10) { allScores.size() } else { 10 });
  };
};
