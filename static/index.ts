let $ = $ || function(){
    return {
        html: function(){
            return;
        },
        on: function(){
            return;
        }
    }
};

let toLowerSerpent = function(input: String){
    return input.toLowerCase().split(" ").join("-");
}

let generateUniqueHashId = function(){
    return Math.random().toString(16).replace(".", "") + new Date().getTime().toString(16);
}

// Base Classes
class BaseNode {
    name: string;
    id: string;
    visible: string;
    
}

// Hierarchy Classes
class HierarchyController {
    hierarchyModel: HierarchyModel
    hierarchyView: HierarchyView
    noteMenuController: NoteMenuController
    constructor(hierarchyModel: HierarchyModel, hierarchyView: HierarchyView) {
        this.hierarchyModel = hierarchyModel;
        this.hierarchyView = hierarchyView;
        this.display();
    }
    display(){
        this.hierarchyView.display(this);
        this.hierarchyView.initLogic(this);
    }
    collapseNode(nodeId:String){
        this.hierarchyModel.collapseNode(nodeId);
        this.display();
    }
    edit(nodeId:String){
        this.hierarchyView.edit(nodeId, this);
    }
    updateNodeName(nodeId:String, newNodeName:String){
        this.hierarchyModel.updateNodeName(nodeId, newNodeName);
        this.display();
    }
    saveContent(nodeId:String, newContent:String){
        this.hierarchyModel.save(nodeId:String, newContent:String);
    }
    add(newNode:HierarchyNode, nodeId:String){
        this.hierarchyModel.add(newNode, nodeId:String);
        this.display();
    }
    remove(nodeId:String){
        this.hierarchyModel.remove(nodeId:String);
        this.display();
    }
    find(nodeId:String){
        let hierarchyRoot = this.hierarchyModel.hierarchyRoot;
        return this.hierarchyModel.findNode(hierarchyRoot, nodeId);
    }
    findAsList(nameSubstring:String){
        let searchResult = this.hierarchyModel.findAsList(nameSubstring);
        return searchResult || [];
    }
    findByCollapsingHierarchy(nameSubstring:String){
        this.hierarchyModel.findByCollapsingHierarchy(nameSubstring);
        this.display();
    }
    addNoteId(hierarchyNodeId: String, noteNodeId: String){
        let hierarchyNode = this.find(hierarchyNodeId);
        
        hierarchyNode.noteIds.push(noteNodeId);
    }
}

class HierarchyView {
    hierarchyController: HierarchyController
    hierarchyWindow: Object
    constructor(hierarchyWindow: Object){
        this.hierarchyWindow = hierarchyWindow;
    }
    displayHierarchyView(hierarchyController:HierarchyController){
        let hierarchyModel = hierarchyController.hierarchyModel;
        return "" + 
            "<div id='search-area'>"    +
                this.displaySearchBar() +
            "</div>"                    +
            "<div id='hierarchy-view'>" + 
                this.displayHierarchyModelHTML(hierarchyModel) + // TODO: Change displayHierarchyModelHTML Signature to Includ Controller
            "</div>";
    }
    displayHierarchyModelHTML(hierarchyModel:HierarchyModel){
        let result = "";
        let previousIndentAmount = 0;
        let hierarchyModel = hierarchyModel.getHierarchyModelAsObject();
        hierarchyModel.iterate(
            hierarchyModel.hierarchyRoot, 
            (node: HierarchyNode, indentAmount: Number) => {
                if (indentAmount > previousIndentAmount){
                    // for (let i = 0; i < indentAmount - previousIndentAmount; i++){ 
                        result += "<ul>";
                    // }
                } else 
                if (indentAmount < previousIndentAmount){
                    for (let i = 0; i < previousIndentAmount - indentAmount; i++){ // UL tags must match indentation levels
                        result += "</ul>";
                    }
                }
                previousIndentAmount = indentAmount;
                result += this.displayNodeHTML(node);
            },
            previousIndentAmount
        );
        for (let i = 0; i < previousIndentAmount; i++){
            result += "</ul>";
        }
        return "" + 
            "<ul>"      + 
                result  + 
            "</ul>";
    }
    displaySearchBar(){
        return ""                           + 
            "<input id='hierarchy-search-input' placeholder='Search'></input>" +
            "<button id='hierarchy-search-button'>Search</button>";
    }
    displayNodeHTML(node: HierarchyNode){
        if (node.visible){
            return this.generateNodeListElement(node.id, node.name);
        } else {
            return "";
        }
    }
    generateNodeStyle(){
        return "style='width: 200px;'";
    }
    generateNodeListElement(nodeId:String, nodeName:String){
        return ""                                                                                       +
            "<li "+this.generateNodeStyle()+">"                                                         +
                "<div class='node' id='"+nodeId+"'>"                                                    +
                    "<span class='node-name' "+this.generateNodeNameStyle()+">"                         +
                        nodeName                                                                        +
                    "</span>"                                                                           +
                    this.generateNodeButtons()                                                          +
                "</div>"                                                                                +
                
            "</li>"
    }
    generateNodeNameStyle(){
        return "style='font-weight: bold;'";
    }
    generateNodeButtons(){
        return "" +
                "<div class='node-buttons'>"                                                            +
                    "<span class='collapse'> collapse </span>|"                                         + 
                    "<span class='edit'> edit </span>|"                                                 + 
                    "<span class='add'> add </span>|"                                                   + 
                    "<span class='remove'> remove </span>"                                              +
                "</div>";
    }
    display(hierarchyController: HierarchyController){
        this.hierarchyWindow.html(this.displayHierarchyView(hierarchyController));
    }
    initLogic(hierarchyController: HierarchyController){
        $(".node-name").on("click", (e)=>{
            let $node = $(e.currentTarget);
            let nodeId = $node.parent(".node").attr("id");
            let node = hierarchyController.find(nodeId);
            let noteIds = []
            if (hierarchyController.hierarchyModel.hierarchyRoot.id === node.id){
                hierarchyController.noteMenuController.display();
            } else {
                noteIds = node.noteIds;
                hierarchyController.noteMenuController.displayNotesByIds(noteIds);
            }
        });
        $(".collapse").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".node")[0].id;
            hierarchyController.collapseNode(nodeId);
        })
        $(".edit").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".node")[0].id;
            hierarchyController.edit(nodeId);
        })
        $(".add").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".node")[0].id;
            hierarchyController.add(new HierarchyNode("New Node", []), nodeId);
        })
        $(".remove").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".node")[0].id;
            hierarchyController.remove(nodeId);
        })
        $("#hierarchy-search-button").on("click", (e)=>{
            
            let $button = $(e.currentTarget);
            let $input = $button.siblings("#hierarchy-search-input");
            let input = $input.val();
            
            hierarchyController.findByCollapsingHierarchy(input);
        })
    }
    edit(nodeId: String, hierarchyController: HierarchyController){
        let node = $("#"+nodeId);
        let nodeName = node.find(".node-name").text();
        let html = ""                                   +
            "<input placeholder='" + nodeName + "'>" +
            "<button class='save'>Save</button>"        + 
            "<button class='cancel'>Cancel</button>";
        node.html(html);
        node.find(".cancel").on("click", ()=>{
            hierarchyController.display();
        });
        node.find(".save").on("click", ()=>{
            let newNodeName = node.find("input").val();
            hierarchyController.updateNodeName(nodeId, newNodeName);
            hierarchyController.display();
        });
    }
}

class HierarchyModel {
    hierarchyRoot: HierarchyNode
    constructor(hierarchy: Object){
        if (hierarchy.hasOwnProperty("name")){
            this.hierarchyRoot = this.buildHierarchyFromObject(hierarchy, new HierarchyNode(hierarchy.name, []));
        } else {
            return;
        }
    }
    getHierarchyModelAsObject(){
        return this;
    }
    buildHierarchyFromObject(hierarchy: Object, currentNode: HierarchyNode){
        let childNode = null;
        if (hierarchy.hasOwnProperty("name")){
            currentNode.name = hierarchy.name;
        } else {
            return null;
        }
        if (hierarchy.hasOwnProperty("children")){
            for (let child in hierarchy.children){
                childNode = this.buildHierarchyFromObject(
                    hierarchy.children[child], 
                    new HierarchyNode("",[])
                )
                if (childNode){
                    currentNode.children.push(childNode);
                }
            }
        }
        if (hierarchy.hasOwnProperty("visible")){
            currentNode.visible = hierarchy.visible;
        }
        if (hierarchy.hasOwnProperty("collapsed")){
            currentNode.collapsed = hierarchy.collapsed;
        }
        return currentNode;
    }
    iterate(currentNode: HierarchyNode, callback: Function, indentAmount: Number){
        if (currentNode){
            callback(currentNode, indentAmount);
            indentAmount++;
            for (let childNode of currentNode.children){
                this.iterate(childNode, callback, indentAmount);
            }
        } else {
            return
        }
    }
    toggleNode(node: HierarchyNode){
        for (let childNode of node.children){
            childNode.visible = !childNode.visible;
            this.toggleNode(childNode);
        }
    }
    hideChildren(parent: HierarchyNode){
        for (let childNode of parent.children){
            childNode.visible = false;
            this.hideChildren(childNode);
        }
    }
    showChildren(parent: HierarchyNode){
        for (let childNode of parent.children){
            if (!parent.collapsed && parent.visible) {
                childNode.visible = true;
            }
            this.showChildren(childNode);
        }
    }
    findNode(currentNode: HierarchyNode, nodeId: String){
        if (currentNode.id === nodeId) {
            return currentNode;
        } else {
            let resultNode = null;
            for (let childNode of currentNode.children){
                resultNode = this.findNode(childNode, nodeId);
                if (resultNode && resultNode.id === nodeId){
                    return resultNode;
                }
            }
            return resultNode;
        }
    }
    removeNode(currentNode: HierarchyNode, nodeId: String){
        if (currentNode.id === nodeId) {
            let resultNodeIndex = currentNode.children.indexOf(resultNode);
            currentNode.children.splice(resultNodeIndex, resultNodeIndex+1);
            return currentNode;
        } else {
            let resultNode = null;
            for (let childNode of currentNode.children){
                resultNode = this.removeNode(childNode, nodeId);
                if (resultNode && resultNode.id === nodeId){
                    let resultNodeIndex = currentNode.children.indexOf(resultNode);
                    currentNode.children.splice(resultNodeIndex, resultNodeIndex+1);
                }
            }
            return resultNode;
        }
    }
    add(newNode:HierarchyNode, nodeId:String){
        let node = this.findNode(this.hierarchyRoot, nodeId);
        node.children.unshift(newNode);
    }
    remove(nodeId:String){
        let node = this.removeNode(this.hierarchyRoot, nodeId);
    }
    collapseNode(nodeId: String){
        let nodeToCollapse = this.findNode(this.hierarchyRoot, nodeId);
        nodeToCollapse.collapsed = !nodeToCollapse.collapsed;
        if (nodeToCollapse.collapsed){
            this.hideChildren(nodeToCollapse);
        } else {
            this.showChildren(nodeToCollapse);
        }
    }
    updateNodeName(nodeId:String, newNodeName:String){
        let node = this.findNode(this.hierarchyRoot, nodeId);
        node.name = newNodeName;
    }
    containsSubstring(str:String, substr:String){
        return str.toLowerCase().indexOf(substr.toLowerCase()) !== -1;
    }
    findAsList(nameSubstring:String){
        let result = [];
        this.iterate(this.hierarchyRoot, (currentNode) => {
            if (this.containsSubstring(currentNode.name, nameSubstring)){
                result.push(currentNode);
            }
        }, 0)
        return result;
    }
    findByCollapsingHierarchy(nameSubstring:String){
        let hasVisibleChildren = function(node:HierarchyNode){
            let result = false;
            for (let child of node.children){
                
            }
        }
        this.iterateFromTail(this.hierarchyRoot, (child, parent) => {
            if (child.children.length === 0){ // if leaf
                if (this.containsSubstring(child.name, nameSubstring)){
                    child.visible = true;
                    parent.visible = true;
                } else {
                    child.visible = false;
                    parent.visible = false;
                }
            } else {
                if (child.visible){
                    parent.visible = true;
                } else
                if (this.containsSubstring(child.name, nameSubstring)){
                    child.visible = true;
                    parent.visible = true;
                }
            }
        });
    }
    iterateFromTail(currentNode:HierarchyNode, callback:Function){
        for (let child of currentNode.children){
            this.iterateFromTail(child, callback);
            callback(child, currentNode);
        }
    }
}

class HierarchyNode extends BaseNode {
    collapsed: Boolean;
    children: Array<BaseNode>;
    noteIds: Array<String>;
    constructor(name: string, children: Array<HierarchyNode>){
        this.name = name;
        this.id = generateUniqueHashId();
        this.children = children;
        this.visible = true;
        this.collapsed = false;
        this.noteIds = [];
    }
}

// Notes Classes
class NoteNode extends BaseNode {
    labelIds: Array<String>
    constructor(name: string){
        this.name = name;
        this.id = generateUniqueHashId();
        this.visible = true;
        this.content = "";
        this.labelIds = [];
    }
}

class NoteMenuModel {
    notes: Array<BaseNode>;
    constructor(noteList:Array<BaseNode>){
        this.notes = this.convertJsonArrayToNoteArray(noteList);
    }
    convertJsonArrayToNoteArray(noteList:Array<BaseNode>){
        let notes = [];
        let noteNode;
        for (let note of noteList){
            if (note.hasOwnProperty("name")){
                noteNode = new NoteNode(note.name);
                if (note.hasOwnProperty("content")){
                    noteNode.content = note.content;
                }
                notes.unshift(noteNode);
            }
        }
        return notes;
    }
    add(note:NoteNode){
        this.notes.unshift(note);
    }
    remove(noteId:string){
        let node = this.findNode(noteId);
        if (node){
            let index = this.notes.indexOf(node);
            this.notes.splice(index, index+1);
        }
    }
    findNode(noteId:string){
        for (let note of this.notes){
            if (note.id === noteId){
                return note;
            }
        }
        return null;
    }
    updateNoteContent(noteId:String, newContent:String){
        let node = this.findNode(noteId);
        node.content = newContent;
    }
}

class NoteMenuController {
    noteMenuModel: NoteMenuModel
    noteMenuView: NoteMenuView
    hierarchyController: HierarchyController
    constructor(noteMenuModel: NoteMenuModel, noteMenuView: NoteMenuView) {
        this.noteMenuModel = noteMenuModel;
        this.noteMenuView = noteMenuView;
        this.display();
    }
    display(){
        this.noteMenuView.display(this);
        this.noteMenuView.initLogic(this);
    }
    edit(nodeId:String){
        this.noteMenuView.edit(nodeId, this);
    }
    updateNodeName(nodeId:String, newNodeName:String){
        this.noteMenuModel.updateNodeName(nodeId, newNodeName);
        this.display();
    }
    updateNoteContent(nodeId:String, newContent:String){
        this.noteMenuModel.updateNoteContent(nodeId, newContent);
    }
    add(nodeId:String){
        this.noteMenuModel.add(new NoteNode("New Note", []));
        this.display();
    }
    remove(nodeId:String){
        this.noteMenuModel.remove(nodeId:String);
        this.display();
    }
    displayNote(nodeId:String){
        this.noteMenuView.displayNote(nodeId, this);
    }
    displayNotesByIds(noteIds:Array<String>){
        let notes = [];
        for (let noteId of noteIds){
            let note = this.findNote(noteId);
            notes.unshift(note);
        }
        
        this.noteMenuView.displayNotes(notes, this);
        this.noteMenuView.initLogic(this);
    }
    findNote(noteId:String){
        return this.noteMenuModel.findNode(noteId);
    }
    addLabel(noteNodeId: String, hierarchyNodeId: String){
        let noteNode = this.findNote(noteNodeId);
        noteNode.labelIds.push(hierarchyNodeId);
        this.hierarchyController.addNoteId(hierarchyNodeId, noteNodeId);
    }
    findHierarchyNodesAsList(name:String){
        return this.hierarchyController.findAsList(name);
    }
}

class NoteMenuView {
    noteMenuController: noteMenuController
    noteMenuWindow: Object
    constructor(noteMenuWindow: Object){
        this.noteMenuWindow = noteMenuWindow;
    }
    displayNotes(notes:Array<NoteNode>, noteMenuController:NoteMenuController){
        this.noteMenuWindow.html(this.displayNoteMenuModelHTML(notes, noteMenuController));
    }
    displayNoteMenuModelHTML(notes:Array<NoteNode>, noteMenuController:NoteMenuController){
        let result = "";
        for (let note of notes){
            result += this.displayNoteHTML(note, noteMenuController);
        }
        return "<ul>" + result + "</ul>";
    }
    displayNoteHTML(node: NoteNode, noteMenuController:NoteMenuController){
        return this.generateNodeListElement(node.id, node.name, noteMenuController);
    }
    generateNodeStyle(){
        return "style='width: 200px;'";
    }
    generateNodeListElement(nodeId:String, nodeName:String, noteMenuController:NoteMenuController){
        return ""                                                                                       +
            "<li "+this.generateNodeStyle()+">"                                                         +
                "<div class='note' id='"+nodeId+"'>"                                                    +
                    "<span class='note-name' "+this.generateNodeNameStyle()+">"                         +
                        nodeName                                                                        +
                    "</span>"                                                                           +
                    this.generateNodeButtons()                                                          +
                "</div>"                                                                                +
                this.displayLabels(nodeId, noteMenuController)                                          +
            "</li>"
    }
    generateNodeNameStyle(){
        return "style='font-weight: bold;'";
    }
    generateNodeButtons(){
        return "" +
                "<div class='node-buttons'>"                                                            +
                    "<span class='collapse'> collapse </span>|"                                         + 
                    "<span class='edit'> edit </span>|"                                                 + 
                    "<span class='add'> add </span>|"                                                   + 
                    "<span class='remove'> remove </span>"                                              +
                "</div>";
    }
    display(noteMenuController:noteMenuController){
        let notes = noteMenuController.noteMenuModel.notes;
        this.noteMenuWindow.html(this.displayNoteMenuModelHTML(notes, noteMenuController));
    }
    initLogic(noteMenuController: NoteMenuController){
        this.noteMenuController = noteMenuController;
        $(".note-name").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".note")[0].id;
            
            noteMenuController.displayNote(nodeId, noteMenuController);
        })
        $(".collapse").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".note")[0].id;
            noteMenuController.collapseNode(nodeId);
        })
        $(".edit").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".note")[0].id;
            noteMenuController.edit(nodeId);
        })
        $(".add").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".note")[0].id;
            noteMenuController.add(nodeId);
        })
        $(".remove").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".note")[0].id;
            noteMenuController.remove(nodeId);
        })
    }
    edit(nodeId: String, noteMenuController: NoteMenuController){
        let node = $("#"+nodeId);
        let nodeName = node.find(".node-name").text();
        let html = ""                                   +
            "<input placeholder='" + nodeName + "'>" +
            "<button class='save'>Save</button>"        + 
            "<button class='cancel'>Cancel</button>";
        node.html(html);
        node.find(".cancel").on("click", ()=>{
            noteMenuController.display();
        });
        node.find(".save").on("click", ()=>{
            let newNodeName = node.find("input").val();
            noteMenuController.updateNodeName(nodeId, newNodeName);
            noteMenuController.display();
        });
    }
    displayNote(noteId:String, noteMenuController: NoteMenuController){
        let node = noteMenuController.noteMenuModel.findNode(noteId);
        
        if (node) {
            let notesArea = $("#notes-area");
            notesArea.html(
                "<div class='note-view'>"                   +
                    "<div class='note-content'></div>"      +
                    this.displayNoteContentButtons()        +
                    this.displayLabels(noteId, noteMenuController) +
                "</div>"
            );
            $(".note-content").html(node.content);
        }
        $("#edit-note").on("click", ()=>{
            this.displayEditor(noteId, noteMenuController);
        });
        $("#return-note").on("click", ()=>{
            noteMenuController.display();
        });
        $("#label-search-input").on("focusin", ()=>{
            let labels = noteMenuController.findHierarchyNodesAsList("");
            $("#label-search-datalist").html(this.displayDataListOptions(labels));
        });
        $("#label-search-input").on("focusout", ()=>{
            $("#label-search-datalist").html("");
        });
        $("#label-search-add-button").on("click", (e)=>{
            let $button = $(e.currentTarget);
            let $input = $("#label-search-input");
            let value = $input.val();
            let labelId = value.split("-")[1];
            
            noteMenuController.addLabel(noteId, labelId);
            this.displayNote(noteId, noteMenuController);
        })
    }
    displayLabels(noteId:String, noteMenuController:NoteMenuController){
        let note = noteMenuController.findNote(noteId);
        let result = "";
        let labels = note.labelIds;
        for (let label of labels){
            let node = noteMenuController.hierarchyController.find(label);
            result += "<span>"+node.name+"</span>";
        }
        return "<div class='labels'>" + result + "</div>";

    }
    displayNoteContentButtons(){
        return "" +
            "<button id='edit-note'>Edit</button>" +
            "<button id='return-note'>Return</button>" +
            this.displayDataList();
    }
    displayDataList(){
        return "" +
            "<input id='label-search-input' list='label-search-datalist'>" +
            "<datalist id='label-search-datalist'></datalist>" + 
            "<button id='label-search-add-button'>Add Label</button>";
    }
    displayDataListOptions(nodeList:Array<HierarchyNode>){
        let result = "";
        for (let node of nodeList){
        result += "<option value='"+node.name+"-"+node.id+"'>"
        }
        return result;
    }
    displayEditor(noteId:String, noteMenuController:NoteMenuController){
        let note = noteMenuController.findNote(noteId);
        if (note) {
            let notesArea = $("#notes-area");
            notesArea.html(
                "<div class='note-view'>"                           +
                    "<textarea class='note-editor'></textarea>"     +
                    this.displayNoteEditorButtons()                 +
                "</div>"
            );
            $(".note-editor").val(note.content);
        }
        $("#save-note").on("click", ()=>{
            let newContent = $(".note-editor").val();
            noteMenuController.updateNoteContent(noteId, newContent);
            this.displayNote(noteId, noteMenuController);
        });
        $("#cancel-note").on("click", ()=>{
            noteMenuController.display();
        });
    }
    displayNoteEditorButtons(){
        return "" + 
            "<button id='save-note'>Save</button>" +
            "<button id='cancel-note'>Cancel</button>"
    }
}

let hierarchyModel = new HierarchyModel(
    {
        name: "ROOT",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    }
)
let hierarchyView = new HierarchyView($("#hierarchy-area"));
let hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);
let noteMenuModel = new NoteMenuModel(
    [
        {
            name: "Note001",
            id: generateUniqueHashId(),
            content: "Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor..."
        }  
    ]
);
let noteMenuView = new NoteMenuView($("#notes-area"));
let noteMenuController = new NoteMenuController(noteMenuModel, noteMenuView);

hierarchyController.noteMenuController = noteMenuController;
noteMenuController.hierarchyController = hierarchyController;

// Node Unit Tests
exports.NOTE_MENU_JsonToListTest = function(test) {
    let noteMenuModel = new NoteMenuModel([{
       name: "note001",
       id: generateUniqueHashId(),
       visible: true,
       articleId: null,
       labelIds: []
    }]);
    let noteNode = new NoteNode("note001", []);
    test.notEqual(noteMenuModel.notes[0].id, noteNode.id);
    noteMenuModel.notes[0].id="";
    noteNode.id="";
    test.deepEqual(noteMenuModel.notes[0], noteNode);
    test.done();
};

exports.NOTE_MENU_MODEL_AddTest = function(test) {
    let noteMenuModel = new NoteMenuModel({
        name: "note001",
        id: generateUniqueHashId(),
        visible: true,
        articleId: null,
        labelIds: []
    });
    let newNode = new NoteNode("node002");
    noteMenuModel.add(newNode);
    test.deepEqual(newNode, noteMenuModel.notes[0]);
    test.done();
}

exports.NOTE_MENU_MODEL_RemoveTest = function(test) {
    
    let noteMenuModel = new NoteMenuModel({
        name: "note001",
        id: generateUniqueHashId(),
        visible: true,
        articleId: null,
        labelIds: []
    });
    
    let newNode = new NoteNode("node002");
    noteMenuModel.add(newNode);
    noteMenuModel.remove(newNode.id);
    
    test.ok(0===noteMenuModel.notes.length);
    test.done();
}

exports.NOTE_MENU_MODEL_UpdateNoteContent = function(test) {
    let noteMenuModel = new NoteMenuModel({
        name: "note001",
        id: generateUniqueHashId(),
        visible: true,
        articleId: null,
        labelIds: []
    });
    
    let newNode = new NoteNode("node002");
    noteMenuModel.add(newNode);
    noteMenuModel.updateNoteContent(newNode.id, "Content");
    
    test.equals("Content", noteMenuModel.notes[0].content);
    test.done();
}

exports.NOTE_MENU_CONTROLLER_AddLabelToNote = function(test){ // NOTE: It is very important to not depend on MODEL function implementations, as their implementation may always change, but to depend on CONTROLLER's ones.
    let id = generateUniqueHashId();
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: id,
        collapsed: false,
        visible: true,
        children: []
    });
    let hierarchyView = new HierarchyView($(""));
    let hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);
    let noteMenuModel = new NoteMenuModel([
        {
            name: "Note001",
            id: generateUniqueHashId(),
            content: "Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor..."
        }  
    ]);
    let noteMenuView = new NoteMenuView($(""));
    let noteMenuController = new NoteMenuController(noteMenuModel, noteMenuView);
    noteMenuController.hierarchyController = hierarchyController;
    hierarchyController.noteMenuController = noteMenuController;
    let node002 = new HierarchyNode("node002", []);
    hierarchyController.add(node002, hierarchyModel.hierarchyRoot.id);
    let node003 = new HierarchyNode("Test", []);
    hierarchyController.add(node003, node002.id);
    let noteNode = noteMenuModel.notes[0];
    
    noteMenuController.addLabel(noteNode.id, node002.id);
    test.equals(node002.id, noteNode.labelIds[0]);
    test.equals(node002.noteIds[0], noteNode.id);
    test.done();
}

exports.HIERARCHY_MODEL_JsonToTreeTest = function(test) {
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    let hierarchyNode = new HierarchyNode("node001", []);
    test.notEqual(hierarchyModel.hierarchyRoot.id, hierarchyNode.id);
    hierarchyModel.hierarchyRoot.id = "";
    hierarchyNode.id = "";
    test.deepEqual(hierarchyModel.hierarchyRoot, hierarchyNode);
    test.done();
};

exports.HIERARCHY_MODEL_AddTest = function(test) {
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    let newNode = new HierarchyNode("node002", []);
    hierarchyModel.add(newNode, hierarchyModel.hierarchyRoot.id);
    test.deepEqual(newNode, hierarchyModel.hierarchyRoot.children[0]);
    test.done();
}

exports.HIERARCHY_MODEL_RemoveTest = function(test) {
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    let newNode = new HierarchyNode("node002", []);
    hierarchyModel.add(newNode, hierarchyModel.hierarchyRoot.id);
    hierarchyModel.remove(newNode.id); // TODO: Change Node Name to Unique ID!
    test.deepEqual(0, hierarchyModel.hierarchyRoot.children.length);
    test.done();
}

exports.HIERARCHY_MODEL_UpdateNode = function(test){
    let id = generateUniqueHashId();
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: id,
        collapsed: false,
        visible: true,
        children: []
    });
    hierarchyModel.updateNodeName(hierarchyModel.hierarchyRoot.id, "Test");
    
    test.done();
}

exports.HIERARCHY_CONTROLLER_FindAsList = function(test){ // NOTE: It is very important to not depend on MODEL function implementations, as their implementation may always change, but to depend on CONTROLLER's ones.
    let id = generateUniqueHashId();
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: id,
        collapsed: false,
        visible: true,
        children: []
    });
    let hierarchyView = new HierarchyView($(""));
    let hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);
    let newNode = new HierarchyNode("node002", []);
    hierarchyController.add(newNode, hierarchyModel.hierarchyRoot.id);
    let results = hierarchyController.findAsList("node");
    test.equals(2, results.length);
    results = hierarchyController.findAsList("001");
    test.equals(1, results.length);
    results = hierarchyController.findAsList("003");
    test.equals(0, results.length);
    test.done();
}

exports.HIERARCHY_CONTROLLER_FindByCollapsingHierarchy = function(test){ // NOTE: It is very important to not depend on MODEL function implementations, as their implementation may always change, but to depend on CONTROLLER's ones.
    let id = generateUniqueHashId();
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: id,
        collapsed: false,
        visible: true,
        children: []
    });
    let hierarchyView = new HierarchyView($(""));
    let hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);
    let node002 = new HierarchyNode("node002", []);
    hierarchyController.add(node002, hierarchyModel.hierarchyRoot.id);
    hierarchyController.findByCollapsingHierarchy("test");
    test.equals(false, hierarchyModel.hierarchyRoot.visible);
    test.equals(false, hierarchyModel.hierarchyRoot.visible);
    hierarchyController.display();
    let node003 = new HierarchyNode("Test", []);
    hierarchyController.add(node003, node002.id);
    hierarchyController.findByCollapsingHierarchy("Test");
    test.equals(true, hierarchyModel.hierarchyRoot.visible);
    test.equals(true, hierarchyModel.hierarchyRoot.children[0].visible);
    test.equals(true, hierarchyModel.hierarchyRoot.children[0].children[0].visible);
    hierarchyController.findByCollapsingHierarchy("test");
    test.equals(true, hierarchyModel.hierarchyRoot.visible);
    test.equals(true, hierarchyModel.hierarchyRoot.children[0].visible);
    test.equals(true, hierarchyModel.hierarchyRoot.children[0].children[0].visible);
    hierarchyController.findByCollapsingHierarchy("node002");
    test.equals(true, hierarchyModel.hierarchyRoot.visible);
    test.equals(true, hierarchyModel.hierarchyRoot.children[0].visible);
    test.equals(false, hierarchyModel.hierarchyRoot.children[0].children[0].visible);
    test.done();
}

exports.HIERARCHY_VIEW_JsonToDOMTreeTest = function(test) {
    var nodeId001 = "";
    var nodeId002 = "";
    var nodeId003 = "";
    var nodeId004 = "";
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    nodeId001 = hierarchyModel.hierarchyRoot.id;
    let html = "";
    let hierarchyView = new HierarchyView($());
    html = "" + 
            "<ul>"                                                          +
                hierarchyView.generateNodeListElement(nodeId001, "node001") +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    let node002 = new HierarchyNode("node002", []);
    nodeId002 = node002.id;
    hierarchyModel.add(node002, nodeId001);
    html = "<ul>"                                                                       +
                hierarchyView.generateNodeListElement(nodeId001, "node001")                           +
                "<ul>"                                                                  +
                    hierarchyView.generateNodeListElement(nodeId002, "node002")                       +
                "</ul>"                                                                 +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    let node003 = new HierarchyNode("node003", []);
    nodeId003 = node003.id;
    hierarchyModel.add(node003, nodeId002);
    html = "<ul>"                                                                           +
                hierarchyView.generateNodeListElement(nodeId001, "node001")                               +     
                "<ul>"                                                                      +
                    hierarchyView.generateNodeListElement(nodeId002, "node002")                           +  
                    "<ul>"                                                                  +
                        hierarchyView.generateNodeListElement(nodeId003, "node003")                       +  
                    "</ul>"                                                                 +
                "</ul>"                                                                     +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    let node004 = new HierarchyNode("node004", []);
    nodeId004 = node004.id;
    hierarchyModel.add(node004, nodeId001);
    html = "<ul>"                                                                           +
                hierarchyView.generateNodeListElement(nodeId001, "node001")                               +     
                "<ul>"                                                                      +
                    hierarchyView.generateNodeListElement(nodeId004, "node004")                           +
                    hierarchyView.generateNodeListElement(nodeId002, "node002")                           +  
                    "<ul>"                                                                  +
                        hierarchyView.generateNodeListElement(nodeId003, "node003")                       +  
                    "</ul>"                                                                 +
                "</ul>"                                                                     +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    hierarchyModel.remove(nodeId004);
    html = "<ul>"                                                                           +
                hierarchyView.generateNodeListElement(nodeId001, "node001")                               +     
                "<ul>"                                                                      +
                    hierarchyView.generateNodeListElement(nodeId002, "node002")                           +  
                    "<ul>"                                                                  +
                        hierarchyView.generateNodeListElement(nodeId003, "node003")                       +  
                    "</ul>"                                                                 +
                "</ul>"                                                                     +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    test.done();
};

exports.HIERARCHY_AUX_ToLowerSerpentTest = function(test) {
    let input;
    let result;
    input = "Test Test Test";
    result = toLowerSerpent(input);
    input = "ChChEcK-Test";
    result = toLowerSerpent(input);
    test.equals("chcheck-test", result);
    input = "c  c  c";
    result = toLowerSerpent(input);
    test.equals("c--c--c", result); // Should It Be Like This?
    test.done();
};