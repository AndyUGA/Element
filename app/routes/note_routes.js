var ObjectID = require("mongodb").ObjectID;

module.exports = function(app, db) {
  //Displays home page
  app.get("/", (req, res) => {
    var collection = db.collection("Members");
    var currentNotes = [];

    collection.find({}).toArray(function(err, result) {
      if (err) {
        res.send({ error: " An error has occurred" });
      } else {
        res.render("index", { result: result });
      }
    });
  });

  //Get page to display hwo many points each attendee has
  app.get("/attendeePoints", (req, res) => {
    var collection = db.collection("Members");
    var houseResults;

    collection.find({}).toArray(function(err, memberResults) {
      collection = db.collection("Houses");
      collection.find({}).toArray(function(err, result) {
        houseResults = result;

        if (err) {
          res.send({ error: " An error has occurred" });
        } else {
          res.render("attendeePoints", {
            memberResults: memberResults,
            houseResults: houseResults
          });
        }
      });
    });
  });

  //Get page to display how many points each house has
  app.get("/housePoints", (req, res) => {
    var collection = db.collection("Members");
    var houseResults;

    collection.find({}).toArray(function(err, memberResults) {
      collection = db.collection("Houses");
      collection.find({}).toArray(function(err, result) {
        houseResults = result;

        if (err) {
          res.send({ error: " An error has occurred" });
        } else {
          res.render("housePoints", {
            memberResults: memberResults,
            houseResults: houseResults
          });
        }
      });
    });
  });

  //Update score for attendee
  app.post("/increasePoints/:name/:points/:house", (req, res) => {
    const collection = db.collection("Members");
    const pointsToAdd = parseInt(req.params.points);
    const attendeeName = req.params.name;
    const attendeeHouse = req.params.house;

    collection.find({}).toArray(function(err, result) {
      for (var i = 0; i < result.length; i++) {
        if (attendeeName == result[i].Name) {
          const attendee = result[i];
          const currentPoints = parseInt(attendee.Points);
          const attendeeID = { _id: new ObjectID(attendee._id) };
          const attendeeContent = {
            $set: {
              Name: attendeeName,
              House: attendeeHouse,
              Points: currentPoints + pointsToAdd
            }
          };

          db.collection("Members").updateOne(
            attendeeID,
            attendeeContent,
            (err, item) => {
              if (err) {
                console.log("Error is " + err);
                res.send({ "Error is ": +err });
              } else {
                res.redirect(
                  "/increaseHousePoints/" + attendeeHouse + "/" + pointsToAdd
                );
              }
            }
          );
          break;
        }
      }
    });
  });

  //Update score for attendee house
  app.get("/increaseHousePoints/:house/:pointsToAdd", (req, res) => {
    const houseName = req.params.house;
    const pointsToAdd = req.params.pointsToAdd;
    const collection = db.collection("Houses");

    collection.find({}).toArray(function(err, result) {
      for (var i = 0; i < result.length; i++) {
        const attendee = result[i];
        if (houseName == attendee.Name) {
          const houseID = { _id: new ObjectID(attendee._id) };

          const currentHousePoints = attendee.Points;

          const totalHousePoints =
            parseInt(currentHousePoints) + parseInt(pointsToAdd);
          const houseContent = {
            $set: {
              Name: attendee.Name,
              Points: totalHousePoints
            }
          };

          db.collection("Houses").updateOne(
            houseID,
            houseContent,
            (err, item) => {
              if (err) {
                console.log("Error is " + err);
                res.send({ "Error is ": +err });
              } else {
                res.redirect("/attendeePoints");
              }
            }
          );

          //Break out of loop if a match is found
          break;
        }
      }
    });
  });

  app.post("/record/:name/:points/:house", (req, res) => {
    const collection = db.collection("History");
    const pointsToAdd = parseInt(req.params.points);
    const attendeeName = req.params.name;
    const attendeeHouse = req.params.house;

    const attendeeContent = {
      Name: attendeeName,
      House: attendeeHouse,
      Points: pointsToAdd
    };

    collection.insertOne(attendeeContent, (err, item) => {
      if (err) {
        console.log("Error is " + err);
        res.send({ "Error is ": +err });
      } else {
        res.render("history", {
          attendeeContent: attendeeContent
        });
      }
    });
  });
};
