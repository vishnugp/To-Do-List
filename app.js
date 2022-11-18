const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();
let items = [];
let workItems = [];
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://vishnugp:vishnu-10@cluster0.gr53kko.mongodb.net/todolistDB");
const itemsSchema = {
  name: String
};

const Items = mongoose.model("Item", itemsSchema);

const item1 = new Items({
  name: "Welcome to you ToDo List!"
});
const item2 = new Items({
  name: "Hit + button to add a new item."
});
const item3 = new Items({
  name: "<-- Hit This to delete an item."
});

const defaultItems = [item1,item2,item3];
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

Items.deleteMany({name: "Welcome to you ToDo List!"});
Items.deleteMany({name: "Hit + button to add a new item"});
Items.deleteMany({name: "<-- Hit This to delete an item"});


app.get("/", function(req,res){

  Items.find(function(err,foundItems){

      if(foundItems.length === 0){
        Items.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          }
            else{
            console.log("Successfully Inserted");
          }
        });
        res.redirect("/");
    } else{
      res.render("list",{listTitle: "Today", newListItems: foundItems});
    }
    });


  let today = new Date();
  let options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };
  let day = today.toLocaleDateString("en-US",options);

});

app.post("/", function(req,res){
let itemName = req.body.newItem;
const listName = req.body.list;

  const item = new Items({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
      List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });


  }


});
app.post("/delete", function(req,res){
  const checkdItemId = req.body.cbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Items.findByIdAndRemove(checkdItemId, function(err){
      console.log(err);
      res.redirect("/"); });
              }
  else {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkdItemId}}},function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
      });
}
});

app.get("/:customListName",function(req,res){
const customListName = _.capitalize(req.params.customListName);

List.findOne({name: customListName}, function(err,result){

  if(!err){
    if(!result){
      //create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName)
    } else{
      // show a existing list
      res.render("list", {listTitle: result.name, newListItems: result.items} )
    }
  }
});





});

app.get("/about", function(req,res){
  res.render("about");
});

let port = process.env.PORT;
if(port= null || port = ""){
  port = 3000;
}
app.listen(port,function(){
  console.log("Server has started successfully.");
});

// MongDB
