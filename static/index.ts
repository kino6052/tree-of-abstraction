// Globals
let document = document || {};
let $ = $ || function(object){
    return {
        hitCtrl: function(){
            object.keydownCallback({which: 17});
        },
        hitB: function(){
            object.keydownCallback({which: 66});
        }
        html: function(){
            return;
        },
        on: function(){
            return;
        },
        keydown: function(callback, key){
            if (typeof callback === "function"){
                object.keydownCallback = callback;
            }
        },
        keyup: function(){
            
        }
    }
};

$.get = $.get || function(){
    return new Promise((res, rej)=>(res({})));
}

let toLowerSerpent = function(input: String){
    return input.toLowerCase().split(" ").join("-");
}

let moveArrayElement = function(array: Array, oldIndex: number, down: boolean){
    let resultArray = [];
    let resultObject = [];
    let arrayLength = array.length;
    let oldIndex = (arrayLength + oldIndex)%arrayLength; // Case of Negative Indices and Indices Greater than Array Last Index
    let newIndex = (arrayLength + oldIndex + (down?1:-1))%arrayLength;
    let splice = array.splice(oldIndex, 1);
    array.splice(newIndex, 0, splice[0]);
    return [oldIndex, newIndex];
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
    // Private Fields
    hierarchyModel: HierarchyModel
    hierarchyView: HierarchyView
    noteMenuController: NoteMenuController
    shortcutController: ShortcutController
    // Constructor
    constructor(hierarchyModel: HierarchyModel, hierarchyView: HierarchyView) {
        this.hierarchyModel = hierarchyModel;
        this.hierarchyView = hierarchyView;
    }
    // CRUD
    add(newNode:HierarchyNode, nodeId:String){
        this.hierarchyModel.add(newNode, nodeId:String);
        this.display();
    }
    remove(nodeId:String){
        console.warn("Removed Hierarchy Node");
        this.hierarchyModel.remove(nodeId:String);
        this.noteMenuController.removeLabel(nodeId);
        this.display();
    }
    updateNodeName(nodeId:String, newNodeName:String){
        this.hierarchyModel.updateNodeName(nodeId, newNodeName);
        this.display();
    }
    saveContent(nodeId:String, newContent:String){
        this.hierarchyModel.save(nodeId:String, newContent:String);
    }
    addNoteId(hierarchyNodeId: String, noteNodeId: String){
        let hierarchyNode = this.find(hierarchyNodeId);
        hierarchyNode.noteIds.push(noteNodeId);
    }
    removeNoteId(noteNodeId: String){
        this.hierarchyModel.removeNoteId(noteNodeId, this);
        this.display();
    }
    changeParent(newParentNode:HierarchyNode, childNode:HierarchyNode){ // TODO: Move to Model
        // Remove Child Node from Old Parent
        let parentNode = this.findParentNode(childNode);
        if (parentNode){
            parentNode.children = parentNode.children.filter((node)=>{
                if (node.id !== childNode.id){
                    return node;
                }
            });
        } else {
            return; // ROOT node shouldn't be let to change parents
        }
        // Add Child to New Parent
        newParentNode.children = newParentNode.children.filter((node)=>{ // Make Sure There is no Same Node Already
            if (node.id !== childNode.id){
                return node;
            }
        });
        newParentNode.children.unshift(childNode);
    }
    moveChildDown(childNode:HierarchyNode, parentNode:HierarchyNode){
        this.hierarchyModel.moveChildDown(childNode, parentNode);
        this.display();
    }
    moveChildUp(childNode:HierarchyNode, parentNode:HierarchyNode){
        this.hierarchyModel.moveChildUp(childNode, parentNode);
        this.display();
    }
    toggleLabel(label: Label, node:HierarchyNode){
        let labelString = typeof label !== 'number' ? "" : Label[label];
        this.hierarchyModel.toggleLabel(labelString, node:HierarchyNode);
    }
    // Display
    display(){
        this.hierarchyView.display(this);
        this.hierarchyView.initLogic(this);
    }
    edit(nodeId:String){
        this.hierarchyView.edit(nodeId, this);
    }
    collapseNode(nodeId:String){
        this.hierarchyModel.collapseNode(nodeId);
        this.display();
    }
    // Search
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
    findParentNode(node:HierarchyNode){
        return this.hierarchyModel.findParentNode(this.hierarchyModel.hierarchyRoot, node.id);
    }
    iterate(currentNode: HierarchyNode, callback: Function){
        this.hierarchyModel.iterate(currentNode, callback, 0);
    }
    getNoteIdsUpToThisNode(node:HierarchyNode){
        let noteIds = [];
        if (node){
            this.iterate(node, (currentNode)=>{
                if (currentNode && currentNode.noteIds){
                    noteIds = noteIds.concat(currentNode.noteIds);
                }
            });
        }
        return noteIds;
    }
    // Global State
    isCtrlPressed(){
        return this.shortcutController.getIsCtrlPressed();
    }
    isUpPressed(){
        return this.shortcutController.getIsUpPressed();
    }
    isDownPressed(){
        return this.shortcutController.getIsDownPressed();
    }
    setCurrentSelectedNode(currentSelectedNode:HierarchyNode){
        this.shortcutController.setCurrentSelectedNode(currentSelectedNode);
    }
    getCurrentSelectedNode(){
        return this.shortcutController.getCurrentSelectedNode();
    }
    upKeyDownCallback(callback:Function){
        this.shortcutController.setUpKeyDownCallback(callback);
    }
    downKeyDownCallback(callback:Function){
        this.shortcutController.setDownKeyDownCallback(callback);
    }
    ctrlBCallback(callback:Function){
        this.shortcutController.setCtrlBCallback(callback);
    }
    ctrlCCallback(callback:Function){
        this.shortcutController.setCtrlCCallback(callback);
    }
}

class HierarchyModel {
    // Private Fields
    hierarchyRoot: HierarchyNode
    // Constructor
    constructor(hierarchy: Object){
        if (hierarchy.hasOwnProperty("name")){
            this.hierarchyRoot = this.buildHierarchyFromObject(hierarchy, new HierarchyNode(hierarchy.name, []));
        } else {
            return;
        }
    }
    // Export
    getHierarchyModelAsObject(){
        return this;
    }
    // Import
    buildHierarchyFromObject(hierarchy: Object, currentNode: HierarchyNode){
        let childNode = null;
        if (hierarchy.hasOwnProperty("name")){
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
            for (let property in hierarchy){
                if (currentNode[property] !== undefined && property !== "children"){
                    currentNode[property] = hierarchy[property]
                }
            }
            return currentNode;
        } else {
            return null;
        }
    }
    // Search
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
    findParentNode(currentNode: HierarchyNode, nodeId: String){
        let resultNode = null;
        for (let childNode of currentNode.children){
            if (childNode.id === nodeId){
                return currentNode;
            } else {
                let candidate = this.findParentNode(childNode, nodeId);
                if (candidate) {
                    resultNode = candidate;
                }
            }
        }
        return resultNode;
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
    // Update
    toggleNode(node: HierarchyNode){
        for (let childNode of node.children){
            childNode.visible = !childNode.visible;
            this.toggleNode(childNode);
        }
    }
    toggleLabel(label: String, node: HierarchyNode){
        console.log(label, node);
        if (node.label === label){
            node.label = "";
        } else {
            node.label = label;
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
    moveChildDown(childNode:HierarchyNode, parentNode:HierarchyNode){
        let index = 0;
        let found = false;
        parentNode.children.filter((node)=>{
            if (node.id === childNode.id){
                found = true;
            }
            if (!found) {
                index++;
            }
        });
        if (found){
            moveArrayElement(parentNode.children, index, true);
        }
    }
    moveChildUp(childNode:HierarchyNode, parentNode:HierarchyNode){
        let index = 0;
        let found = false;
        parentNode.children.filter((node)=>{
            if (node.id === childNode.id){
                found = true;
            }
            if (!found) {
                index++;
            }
        });
        if (found){
            moveArrayElement(parentNode.children, index, false);
        }
    }
    // Remove
    remove(nodeId:String){
        let node = this.removeNode(this.hierarchyRoot, nodeId);
    }
    removeNode(currentNode: HierarchyNode, nodeId: String){
        let recurseRemoveNode = function(parentNode, childNode, nodeId){
            if (parentNode){
                if (childNode){
                    if (childNode.id === nodeId){
                        parentNode.children = parentNode.children.filter((el)=>{
                           if (el.id !== nodeId){
                               return el;
                           }
                        });
                    } else {
                        for (let child of childNode.children){
                            recurseRemoveNode(childNode, child, nodeId);
                        }
                    }
                }
            } else {
                for (let child of parentNode.children){
                    recurseRemoveNode(childNode, child, nodeId);
                } 
            }
        }
        if (currentNode.id === nodeId) {
            return; // Don't Delete ROOT
        } else {
            for (let child of currentNode.children){
                recurseRemoveNode(currentNode, child, nodeId);
            }
        }
    }
    removeNoteId(noteId:String, hierarchyController:HierarchyController){
        let isFound = false;
        if (noteId){
            this.iterate(this.hierarchyRoot, (currentNode)=>{
                   currentNode.noteIds = currentNode.noteIds.filter((el)=>{
                       if (el !== noteId){
                           return el;
                       } else {
                           isFound = true;
                       }
                   });
            }, 0);   
        }
    }
    // Create
    add(newNode:HierarchyNode, nodeId:String){
        let node = this.findNode(this.hierarchyRoot, nodeId);
        node.children.unshift(newNode);
    }
    // AUX
    containsSubstring(str:String, substr:String){
        return str.toLowerCase().indexOf(substr.toLowerCase()) !== -1;
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
            return this.generateNodeListElement(node);
        } else {
            return "";
        }
    }
    generateNodeStyle(){
        return "style='width: 200px;'";
    }
    generateNodeListElement(node:HierarchyNode){
        return ""                                                                                       +
            "<li "+this.generateNodeStyle()+">"                                                         +
                "<div class='node "+node.label+"' id='"+node.id+"'>"                                                    +
                    "<span class='node-name' "+this.generateNodeNameStyle()+">"                         +
                        node.name                                                                        +
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
        $(".node-name").on("click", (e1)=>{
            let $node = $(e1.currentTarget);
            let nodeId = $node.parent(".node").attr("id");
            let node = hierarchyController.find(nodeId);
            let parentNodeId = $node.closest("li").parent().prev().find(".node").attr("id");
            let parentNode = hierarchyController.find(parentNodeId);
            hierarchyController.setCurrentSelectedNode(node);
            hierarchyController.ctrlBCallback(()=>{
               hierarchyController.toggleLabel(Label.BOOK, node); 
            });
            hierarchyController.ctrlCCallback(()=>{
               hierarchyController.toggleLabel(Label.CATEGORY, node); 
            });
            if (hierarchyController.isCtrlPressed()){
                hierarchyController.upKeyDownCallback(()=>{
                    hierarchyController.moveChildUp(node, parentNode);
                });
                hierarchyController.downKeyDownCallback(()=>{
                    hierarchyController.moveChildDown(node, parentNode);
                });
                $(".node-name").on("click", (e2)=>{
                    let $newParentNode = $(e2.currentTarget);
                    let newParentNodeId = $newParentNode.parent(".node").attr("id");
                    if (nodeId !== newParentNodeId){ // If not the Same Node
                        let newParentNode = hierarchyController.find(newParentNodeId);
                        hierarchyController.changeParent(newParentNode, node);
                        hierarchyController.display();
                    }
                });
            } else {
                let noteIds = []
                if (hierarchyController.hierarchyModel.hierarchyRoot.id === node.id){
                    hierarchyController.noteMenuController.display();
                } else {
                    noteIds = hierarchyController.getNoteIdsUpToThisNode(node);
                    hierarchyController.noteMenuController.displayNotesByIds(noteIds);
                }   
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

enum Label {
    BOOK,
    CATEGORY
}

class HierarchyNode extends BaseNode {
    collapsed: Boolean;
    children: Array<BaseNode>;
    noteIds: Array<String>;
    label: Label;
    constructor(name: string, children: Array<HierarchyNode>){
        this.name = name;
        this.id = generateUniqueHashId();
        this.children = children;
        this.visible = true;
        this.collapsed = false;
        this.noteIds = [];
        this.label = "";
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

class NoteMenuController {
    noteMenuModel: NoteMenuModel
    noteMenuView: NoteMenuView
    hierarchyController: HierarchyController
    constructor(noteMenuModel: NoteMenuModel, noteMenuView: NoteMenuView) {
        this.noteMenuModel = noteMenuModel;
        this.noteMenuView = noteMenuView;
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
        console.warn("Removed Note");
        this.noteMenuModel.remove(nodeId:String);
        this.hierarchyController.removeNoteId(nodeId);
        this.display();
    }
    displayNote(nodeId:String){
        this.noteMenuView.displayNote(nodeId, this);
    }
    displayNotesByIds(noteIds:Array<String>){
        let notes = [];
        for (let noteId of noteIds){
            let note = this.findNote(noteId);
            if (note){
                notes.unshift(note);    
            }
        }
        this.noteMenuView.displayNotes(notes, this);
        this.noteMenuView.initLogic(this);
    }
    findNote(noteId:String){
        return this.noteMenuModel.findNode(noteId);
    }
    addLabel(noteNodeId: String, hierarchyNodeId: String){
        let noteNode = this.findNote(noteNodeId);
        if (hierarchyNodeId) {
            if (noteNode.labelIds.indexOf(hierarchyNodeId)===-1){ // Already Contains NodeId
                noteNode.labelIds.push(hierarchyNodeId);    
                this.hierarchyController.addNoteId(hierarchyNodeId, noteNodeId); 
            }
        }
        
    }
    removeLabel(hierarchyNodeId:String){
        this.noteMenuModel.removeLabel(hierarchyNodeId, this);
        this.display();
    }
    findHierarchyNodesAsList(name:String){
        return this.hierarchyController.findAsList(name);
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
                for (let property in note){
                    if (noteNode[property] !== undefined){
                        noteNode[property] = note[property];    
                    }
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
            this.notes = this.notes.filter((el)=>{
                if (el.id !== noteId){
                    return el;
                }
            });
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
    updateNodeName(nodeId:String, newNodeName:String){
        let node = this.findNode(nodeId);
        node.name = newNodeName;
    }
    removeLabel(hierarchyNodeId:String, noteMenuController:NoteMenuController){
        let isFound = false;
        if (hierarchyNodeId){
            for (let note of this.notes){
                note.labelIds = note.labelIds.filter((el)=>{
                    if(el !== hierarchyNodeId){
                        return el;
                    } else {
                        isFound = true;
                    }
                });
            }
        }
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
        return this.generateNodeListElement(node, noteMenuController);
    }
    generateNodeStyle(){
        return "style='width: 500px;'";
    }
    generateNodeListElement(node:NoteNode, noteMenuController:NoteMenuController){
        if (node){
            return ""                                                                                       +
            "<li "+this.generateNodeStyle()+">"                                                         +
                "<div class='note' id='"+node.id+"'>"                                                   +
                    "<span class='note-list-item-buttons note-name' "+this.generateNodeNameStyle()+">"                         +
                        node.name                                                                       +
                    "</span>"                                                                           +
                    this.generateNodeButtons()                                                          +
                "</div>"                                                                                +
                this.displayLabels(node.id, noteMenuController)                                         +
                this.displayNoteContent(node)                                                           +
            "</li>"    
        } else {
            return "";
        }
    }
    generateNodeNameStyle(){
        return "style='font-weight: bold;'";
    }
    generateNodeButtons(){
        return "" +
                "<div class='node-buttons'>"                                                            +
                    "<span class='note-list-item-buttons edit'> edit </span>|"                                                 + 
                    "<span class='note-list-item-buttons add'> add </span>|"                                                   + 
                    "<span class='note-list-item-buttons remove'> remove </span>"                                              +
                "</div>";
    }
    display(noteMenuController:noteMenuController){
        let notes = noteMenuController.noteMenuModel.notes;
        this.noteMenuWindow.html(this.displayNoteMenuModelHTML(notes, noteMenuController));
    }
    initLogic(noteMenuController: NoteMenuController){
        this.noteMenuController = noteMenuController;
        $(".note-list-item-buttons.note-name").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".note")[0].id;
            
            noteMenuController.displayNote(nodeId, noteMenuController);
        })
        $(".note-list-item-buttons.collapse").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".note")[0].id;
            noteMenuController.collapseNode(nodeId);
        })
        $(".note-list-item-buttons.edit").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".note")[0].id;
            noteMenuController.edit(nodeId);
        })
        $(".note-list-item-buttons.add").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".note")[0].id;
            noteMenuController.add(nodeId);
        })
        $(".note-list-item-buttons.remove").on("click", (e)=>{
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
    displayNoteContent(note:NoteNode){
        let content = "";
        if (note){
            let paragraphs = note.content.split("\n");
            for (let paragraph of paragraphs){
                content += "<p>" + paragraph + "</p>";
            }    
        }
        return "" +
            "<div class='note-list-item-content'>"  +
                content                             +
            "</div>"
    }
    displayLabels(noteId:String, noteMenuController:NoteMenuController){
        let note = noteMenuController.findNote(noteId);
        let result = "";
        let labels = note.labelIds;
        for (let label of labels){
            let node = noteMenuController.hierarchyController.find(label);
            if (node) {
                result += "<span class='note-label-span'>"+node.name+"</span>";    
            }
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

// AUX Classes
class ShortcutController {
    currentSelectedNode: HierarchyNode
    isCtrlPressed: bool
    isUpPressed: bool
    isDownPressed: bool
    upKeyDownCallback: Function
    downKeyDownCallback: Function
    ctrlBCallback: Function
    ctrlCCallback: Function
    constructor(){
        this.isCtrlPressed = false;
        this.isUpPressed = false;
        this.isDownPressed = false;
        this.currentSelectedNode = null;
        this.init();
    }
    setAllKeysToFalse(){
        this.isCtrlPressed = false;
        this.isUpPressed = false;
        this.isDownPressed = false;
        this.upKeyDownCallback = function(){
            
        }
        this.downKeyDownCallback = function(){
            
        }
        this.ctrlBCallback = function(){
            
        }
        this.ctrlCCallback = function(){
            
        }
    }
    init(){
        this.setAllKeysToFalse();
        $(document).keydown(
            (event) => {
                switch ( event.which ) {
                    case 17:
                        this.isCtrlPressed = true;
                        break;
                    case 38:
                        this.isUpPressed = true;
                        this.upKeyDownCallback();
                        break;
                    case 40:
                        this.isDownPressed = true;
                        this.downKeyDownCallback();
                        break;
                    case 66:
                        this.isBPressed = true;
                        if (this.isCtrlPressed){
                            this.ctrlBCallback();
                        }
                        break;
                    case 67:
                        this.idCPressed = true;
                        if (this.isCtrlPressed){
                            this.ctrlCCallback();
                        }
                        break;
                }
            }
        );
        $(document).keyup(
            (event) => {
                if (this.isCtrlPressed && event.which !== 17){ // if Ctrl is Pressed
                    
                } else {
                    this.setAllKeysToFalse();    
                }
            }
        )
    }
    getIsCtrlPressed(){
        return this.isCtrlPressed;
    }
    getIsUpPressed(){
        return this.isUpPressed;
    }
    getIsDownPressed(){
        return this.isDownPressed;
    }
    setCurrentSelectedNode(currentSelectedNode:HierarchyNode){
        this.currentSelectedNode = currentSelectedNode;
    }
    getCurrentSelectedNode(){
        return this.currentSelectedNode;
    }
    setUpKeyDownCallback(callback:Function){
        this.upKeyDownCallback = callback;
    }
    setDownKeyDownCallback(callback:Function){
        this.downKeyDownCallback = callback;    
    }
    setCtrlBCallback(callback:Function){
        this.ctrlBCallback = callback;
    }
    setCtrlCCallback(callback:Function){
        this.ctrlCCallback = callback;
    }
}

Promise.all(
    [
        $.get("/getHierarchy"),
        $.get("/getNotes")
    ]
).then((results)=>{
    let hierarchyModel = new HierarchyModel(
        JSON.parse(results[0]).hierarchy
    )
    
    // Initialize Application
    let hierarchyView = new HierarchyView($("#hierarchy-area"));
    let hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);
    let noteMenuModel = new NoteMenuModel(
        JSON.parse(results[1]).notes
    );
    let noteMenuView = new NoteMenuView($("#notes-area"));
    let noteMenuController = new NoteMenuController(noteMenuModel, noteMenuView);
    let shortcutController = new ShortcutController();
    
    hierarchyController.noteMenuController = noteMenuController;
    hierarchyController.shortcutController = shortcutController;
    noteMenuController.hierarchyController = hierarchyController;
    
    hierarchyController.display();
    noteMenuController.display();
    
    // Global Menu
    $("#application-menu-save").on("click", ()=>{
        let root = hierarchyController.hierarchyModel.hierarchyRoot;
        let JSONroot = JSON.stringify(root);
        $.ajax({
            type: "POST",
            url: "/saveHierarchy",
            data: {hierarchy: root},
            success: (data) => {console.log("Saved Hierarchy")},
            dataType: "application/json"
        }).done(
            (data) => {
                console.log(data);
            }
        )
        let notes = noteMenuController.noteMenuModel.notes;
        let JSONnotes = JSON.stringify(notes);
        $.ajax({
            type: "POST",
            url: "/saveNotes",
            data: {notes: notes},
            success: (data) => {console.log("Saved Hierarchy")},
            dataType: "application/json"
        }).done(
            (data) => {
                console.log(data);
            }
        )
        console.log("Saving");
    }); 
});


// Node Unit Tests
exports.SHORTCUT_CONTROLLER_CtrlCallbacks = function(test){
    let shortcutController = new ShortcutController();
    var isCtrlBPressed = false
    shortcutController.ctrlBCallback = function(){
        isCtrlBPressed = true;        
    }
    $(document).hitCtrl();
    $(document).hitB();
    test.equals(true, isCtrlBPressed);
    test.done();
}

exports.NOTE_MENU_JsonToListTest = function(test) {
    let noteMenuModel = new NoteMenuModel([{
       name: "note001",
       id: generateUniqueHashId(),
       visible: true,
       articleId: null,
       labelIds: ['abc']
    }]);
    let noteNode = new NoteNode("note001", []);
    noteNode.labelIds = ['abc'];
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
    noteMenuController.addLabel(noteNode.id, null);
    test.equals(1, noteNode.labelIds.length);
    noteMenuController.addLabel(noteNode.id, node002.id);
    test.equals(1, noteNode.labelIds.length);
    test.done();
}

exports.NOTE_MENU_CONTROLLER_RemoveLabelFromNote = function(test){ // NOTE: It is very important to not depend on MODEL function implementations, as their implementation may always change, but to depend on CONTROLLER's ones.
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
    test.equals(1, noteNode.labelIds.length);
    noteMenuController.removeLabel(node002.id);
    test.equals(0, noteNode.labelIds.length);
    test.done();
}

exports.NOTE_MENU_CONTROLLER_RemoveLabelFromNoteByRemovingNode = function(test){ // NOTE: It is very important to not depend on MODEL function implementations, as their implementation may always change, but to depend on CONTROLLER's ones.
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
    test.equals(1, noteNode.labelIds.length);
    hierarchyController.remove(node002.id);
    test.equals(0, noteNode.labelIds.length);
    test.done();
}

exports.NOTE_MENU_CONTROLLER_GetLabelIdsUpToThisNode = function(test){ // NOTE: It is very important to not depend on MODEL function implementations, as their implementation may always change, but to depend on CONTROLLER's ones.
    let id = generateUniqueHashId();
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: id,
        collapsed: false,
        visible: true,
        children: [],
        noteIds: ["abc"]
    });
    let hierarchyView = new HierarchyView($(""));
    let hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);
    let node002 = new HierarchyNode("node002", []);
    node002.noteIds = ["def", "ghi"];
    hierarchyController.add(node002, hierarchyModel.hierarchyRoot.id);
    let node003 = new HierarchyNode("Test", []);
    node003.noteIds = ["jkl"];
    hierarchyController.add(node003, node002.id);
    let node004 = new HierarchyNode("Test", []);
    node004.noteIds = ["jkl"];
    hierarchyController.add(node004, node003.id);
    let noteIds = hierarchyController.getNoteIdsUpToThisNode(node002);
    test.deepEqual(["def", "ghi", "jkl", "jkl"], noteIds);
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

exports.HIERARCHY_CONTROLLER_RemoveNoteIdFromNode = function(test){ // NOTE: It is very important to not depend on MODEL function implementations, as their implementation may always change, but to depend on CONTROLLER's ones.
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
    test.equals(1, noteNode.labelIds.length);
    hierarchyController.removeNoteId(noteNode.id);
    test.equals(0, node002.noteIds.length);
    test.done();
}

exports.HIERARCHY_CONTROLLER_ChangeParent = function(test){ // NOTE: It is very important to not depend on MODEL function implementations, as their implementation may always change, but to depend on CONTROLLER's ones.
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
    let node003 = new HierarchyNode("Test", []);
    hierarchyController.add(node003, node002.id);
    hierarchyController.changeParent(hierarchyModel.hierarchyRoot, node003);
    test.equals(2, hierarchyModel.hierarchyRoot.children.length);
    test.equals(0, node002.children.length);
    test.done();
}

exports.HIERARCHY_CONTROLLER_MoveChildUpOrDown = function(test){ // NOTE: It is very important to not depend on MODEL function implementations, as their implementation may always change, but to depend on CONTROLLER's ones.
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
    let node003 = new HierarchyNode("Test", []);
    let node004 = new HierarchyNode("node004", []);
    let node005 = new HierarchyNode("node005", []);
    hierarchyController.add(node003, node002.id);
    hierarchyController.add(node004, node002.id);
    hierarchyController.add(node005, node002.id);
    // ["node005", "node004", "node003"]
    hierarchyController.moveChildUp(node004, node002);
    // ["node004", "node005", "node003"]
    test.equals(node004.id, node002.children[0].id);
    test.equals(node003.id, node002.children[2].id);
    hierarchyController.moveChildDown(node003, node002);
    // ["node003", "node005", "node004"]
    test.equals(node003.id, node002.children[0].id);
    test.done();
}

exports.HIERARCHY_CONTROLLER_RemoveNoteIdFromNodeByRemovingNote = function(test){ // NOTE: It is very important to not depend on MODEL function implementations, as their implementation may always change, but to depend on CONTROLLER's ones.
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
    test.equals(1, noteNode.labelIds.length);
    noteMenuController.remove(noteNode.id);
    test.equals(0, node002.noteIds.length);
    test.done();
}

exports.HIERARCHY_CONTROLLER_ToggleLabel = function(test){
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
    console.log(node002);
    hierarchyController.toggleLabel(Label.BOOK, node002);
    test.equals(node002.label, "BOOK");
    hierarchyController.toggleLabel(Label.BOOK, node002);
    test.equals(node002.label, "");
    hierarchyController.toggleLabel(Label.CATEGORY, node002);
    test.equals(node002.label, "CATEGORY");
    hierarchyController.toggleLabel(Label.BOOK, node002);
    test.equals(node002.label, "BOOK");
    hierarchyController.toggleLabel("test", node002);
    test.equals(node002.label, "");
    hierarchyController.toggleLabel(function(){}, node002);
    test.equals(node002.label, "");
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
                hierarchyView.generateNodeListElement(hierarchyModel.hierarchyRoot) +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    let node002 = new HierarchyNode("node002", []);
    nodeId002 = node002.id;
    hierarchyModel.add(node002, nodeId001);
    html = "<ul>"                                                                       +
                hierarchyView.generateNodeListElement(hierarchyModel.hierarchyRoot)                           +
                "<ul>"                                                                  +
                    hierarchyView.generateNodeListElement(node002)                       +
                "</ul>"                                                                 +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    let node003 = new HierarchyNode("node003", []);
    nodeId003 = node003.id;
    hierarchyModel.add(node003, nodeId002);
    html = "<ul>"                                                                           +
                hierarchyView.generateNodeListElement(hierarchyModel.hierarchyRoot)                               +     
                "<ul>"                                                                      +
                    hierarchyView.generateNodeListElement(node002)                           +  
                    "<ul>"                                                                  +
                        hierarchyView.generateNodeListElement(node003)                       +  
                    "</ul>"                                                                 +
                "</ul>"                                                                     +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    let node004 = new HierarchyNode("node004", []);
    nodeId004 = node004.id;
    hierarchyModel.add(node004, nodeId001);
    html = "<ul>"                                                                           +
                hierarchyView.generateNodeListElement(hierarchyModel.hierarchyRoot)                               +     
                "<ul>"                                                                      +
                    hierarchyView.generateNodeListElement(node004)                           +
                    hierarchyView.generateNodeListElement(node002)                           +  
                    "<ul>"                                                                  +
                        hierarchyView.generateNodeListElement(node003)                       +  
                    "</ul>"                                                                 +
                "</ul>"                                                                     +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    hierarchyModel.remove(nodeId004);
    html = "<ul>"                                                                           +
                hierarchyView.generateNodeListElement(hierarchyModel.hierarchyRoot)                               +     
                "<ul>"                                                                      +
                    hierarchyView.generateNodeListElement(node002)                           +  
                    "<ul>"                                                                  +
                        hierarchyView.generateNodeListElement(node003)                       +  
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

exports.HIERARCHY_AUX_MoveArrayElement = function(test){
    let array = [1, 2];
    let result = moveArrayElement(array, 0, true);
    test.deepEqual([0, 1], result);
    test.deepEqual([2,1], array);
    array = [1, 2];
    result = moveArrayElement(array, 1, true);
    test.deepEqual([1, 0], result);
    test.deepEqual([2,1], array);
    array = [1, 2, 3];
    moveArrayElement(array, 0, false);
    test.deepEqual([2,3,1], array);
    array = [1, 2, 3];
    moveArrayElement(array, 1, false);
    test.deepEqual([2,1,3], array);
    array = [1, 2, 3];
    moveArrayElement(array, 1, true);
    test.deepEqual([1,3,2], array);
    test.done();
}