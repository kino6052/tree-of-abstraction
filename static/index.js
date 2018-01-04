var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var $ = $ || function () {
    return {
        html: function () {
            return;
        },
        on: function () {
            return;
        }
    };
};
var toLowerSerpent = function (input) {
    return input.toLowerCase().split(" ").join("-");
};
var generateUniqueHashId = function () {
    return Math.random().toString(16).replace(".", "") + new Date().getTime().toString(16);
};
// Base Classes
var BaseNode = (function () {
    function BaseNode() {
    }
    return BaseNode;
}());
// Hierarchy Classes
var HierarchyController = (function () {
    function HierarchyController(hierarchyModel, hierarchyView) {
        this.hierarchyModel = hierarchyModel;
        this.hierarchyView = hierarchyView;
        this.display();
    }
    HierarchyController.prototype.display = function () {
        this.hierarchyView.display(this);
        this.hierarchyView.initLogic(this);
    };
    HierarchyController.prototype.collapseNode = function (nodeId) {
        this.hierarchyModel.collapseNode(nodeId);
        this.display();
    };
    HierarchyController.prototype.edit = function (nodeId) {
        this.hierarchyView.edit(nodeId, this);
    };
    HierarchyController.prototype.updateNodeName = function (nodeId, newNodeName) {
        this.hierarchyModel.updateNodeName(nodeId, newNodeName);
        this.display();
    };
    HierarchyController.prototype.saveContent = function (nodeId, newContent) {
        this.hierarchyModel.save(nodeId, String, newContent, String);
    };
    HierarchyController.prototype.add = function (newNode, nodeId) {
        this.hierarchyModel.add(newNode, nodeId, String);
        this.display();
    };
    HierarchyController.prototype.remove = function (nodeId) {
        this.hierarchyModel.remove(nodeId, String);
        this.display();
    };
    HierarchyController.prototype.findAsList = function (nameSubstring) {
        var searchResult = this.hierarchyModel.findAsList(nameSubstring);
        return searchResult || [];
    };
    HierarchyController.prototype.findByCollapsingHierarchy = function (nameSubstring) {
        this.hierarchyModel.findByCollapsingHierarchy(nameSubstring);
        this.display();
    };
    return HierarchyController;
}());
var HierarchyView = (function () {
    function HierarchyView(hierarchyWindow) {
        this.hierarchyWindow = hierarchyWindow;
    }
    HierarchyView.prototype.displayHierarchyView = function (hierarchyController) {
        var hierarchyModel = hierarchyController.hierarchyModel;
        return "" +
            "<div id='search-area'>" +
            this.displaySearchBar() +
            "</div>" +
            "<div id='hierarchy-view'>" +
            this.displayHierarchyModelHTML(hierarchyModel) +
            "</div>";
    };
    HierarchyView.prototype.displayHierarchyModelHTML = function (hierarchyModel) {
        var _this = this;
        var result = "";
        var previousIndentAmount = 0;
        var hierarchyModel = hierarchyModel.getHierarchyModelAsObject();
        hierarchyModel.iterate(hierarchyModel.hierarchyRoot, function (node, indentAmount) {
            if (indentAmount > previousIndentAmount) {
                // for (let i = 0; i < indentAmount - previousIndentAmount; i++){ 
                result += "<ul>";
            }
            else if (indentAmount < previousIndentAmount) {
                for (var i = 0; i < previousIndentAmount - indentAmount; i++) {
                    result += "</ul>";
                }
            }
            previousIndentAmount = indentAmount;
            result += _this.displayNodeHTML(node);
        }, previousIndentAmount);
        for (var i = 0; i < previousIndentAmount; i++) {
            result += "</ul>";
        }
        return "" +
            "<ul>" +
            result +
            "</ul>";
    };
    HierarchyView.prototype.displaySearchBar = function () {
        return "" +
            "<input id='hierarchy-search-input' placeholder='Search'></input>" +
            "<button id='hierarchy-search-button'>Search</button>";
    };
    HierarchyView.prototype.displayNodeHTML = function (node) {
        if (node.visible) {
            return this.generateNodeListElement(node.id, node.name);
        }
        else {
            return "";
        }
    };
    HierarchyView.prototype.generateNodeStyle = function () {
        return "style='width: 200px;'";
    };
    HierarchyView.prototype.generateNodeListElement = function (nodeId, nodeName) {
        return "" +
            "<li " + this.generateNodeStyle() + ">" +
            "<div class='node' id='" + nodeId + "'>" +
            "<span class='node-name' " + this.generateNodeNameStyle() + ">" +
            nodeName +
            "</span>" +
            this.generateNodeButtons() +
            "</div>" +
            "</li>";
    };
    HierarchyView.prototype.generateNodeNameStyle = function () {
        return "style='font-weight: bold;'";
    };
    HierarchyView.prototype.generateNodeButtons = function () {
        return "" +
            "<div class='node-buttons'>" +
            "<span class='collapse'> collapse </span>|" +
            "<span class='edit'> edit </span>|" +
            "<span class='add'> add </span>|" +
            "<span class='remove'> remove </span>" +
            "</div>";
    };
    HierarchyView.prototype.display = function (hierarchyController) {
        this.hierarchyWindow.html(this.displayHierarchyView(hierarchyController));
    };
    HierarchyView.prototype.initLogic = function (hierarchyController) {
        $(".collapse").on("click", function (e) {
            var nodeId = $(e.currentTarget).parents(".node")[0].id;
            hierarchyController.collapseNode(nodeId);
        });
        $(".edit").on("click", function (e) {
            var nodeId = $(e.currentTarget).parents(".node")[0].id;
            hierarchyController.edit(nodeId);
        });
        $(".add").on("click", function (e) {
            var nodeId = $(e.currentTarget).parents(".node")[0].id;
            hierarchyController.add(new HierarchyNode("New Node", []), nodeId);
        });
        $(".remove").on("click", function (e) {
            var nodeId = $(e.currentTarget).parents(".node")[0].id;
            hierarchyController.remove(nodeId);
        });
        $("#hierarchy-search-button").on("click", function (e) {
            console.log("test");
            var $button = $(e.currentTarget);
            var $input = $button.siblings("#hierarchy-search-input");
            var input = $input.val();
            console.log("Input: ", input);
            hierarchyController.findByCollapsingHierarchy(input);
        });
    };
    HierarchyView.prototype.edit = function (nodeId, hierarchyController) {
        var node = $("#" + nodeId);
        var nodeName = node.find(".node-name").text();
        var html = "" +
            "<input placeholder='" + nodeName + "'>" +
            "<button class='save'>Save</button>" +
            "<button class='cancel'>Cancel</button>";
        node.html(html);
        node.find(".cancel").on("click", function () {
            hierarchyController.display();
        });
        node.find(".save").on("click", function () {
            var newNodeName = node.find("input").val();
            hierarchyController.updateNodeName(nodeId, newNodeName);
            hierarchyController.display();
        });
    };
    return HierarchyView;
}());
var HierarchyModel = (function () {
    function HierarchyModel(hierarchy) {
        if (hierarchy.hasOwnProperty("name")) {
            this.hierarchyRoot = this.buildHierarchyFromObject(hierarchy, new HierarchyNode(hierarchy.name, []));
        }
        else {
            return;
        }
    }
    HierarchyModel.prototype.getHierarchyModelAsObject = function () {
        return this;
    };
    HierarchyModel.prototype.buildHierarchyFromObject = function (hierarchy, currentNode) {
        var childNode = null;
        if (hierarchy.hasOwnProperty("name")) {
            currentNode.name = hierarchy.name;
        }
        else {
            return null;
        }
        if (hierarchy.hasOwnProperty("children")) {
            for (var child in hierarchy.children) {
                childNode = this.buildHierarchyFromObject(hierarchy.children[child], new HierarchyNode("", []));
                if (childNode) {
                    currentNode.children.push(childNode);
                }
            }
        }
        if (hierarchy.hasOwnProperty("visible")) {
            currentNode.visible = hierarchy.visible;
        }
        if (hierarchy.hasOwnProperty("collapsed")) {
            currentNode.collapsed = hierarchy.collapsed;
        }
        return currentNode;
    };
    HierarchyModel.prototype.iterate = function (currentNode, callback, indentAmount) {
        if (currentNode) {
            callback(currentNode, indentAmount);
            indentAmount++;
            for (var _i = 0, _a = currentNode.children; _i < _a.length; _i++) {
                var childNode = _a[_i];
                this.iterate(childNode, callback, indentAmount);
            }
        }
        else {
            return;
        }
    };
    HierarchyModel.prototype.toggleNode = function (node) {
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var childNode = _a[_i];
            childNode.visible = !childNode.visible;
            this.toggleNode(childNode);
        }
    };
    HierarchyModel.prototype.hideChildren = function (parent) {
        for (var _i = 0, _a = parent.children; _i < _a.length; _i++) {
            var childNode = _a[_i];
            childNode.visible = false;
            this.hideChildren(childNode);
        }
    };
    HierarchyModel.prototype.showChildren = function (parent) {
        for (var _i = 0, _a = parent.children; _i < _a.length; _i++) {
            var childNode = _a[_i];
            if (!parent.collapsed && parent.visible) {
                childNode.visible = true;
            }
            this.showChildren(childNode);
        }
    };
    HierarchyModel.prototype.findNode = function (currentNode, nodeId) {
        if (currentNode.id === nodeId) {
            return currentNode;
        }
        else {
            var resultNode = null;
            for (var _i = 0, _a = currentNode.children; _i < _a.length; _i++) {
                var childNode = _a[_i];
                resultNode = this.findNode(childNode, nodeId);
                if (resultNode && resultNode.id === nodeId) {
                    return resultNode;
                }
            }
            return resultNode;
        }
    };
    HierarchyModel.prototype.removeNode = function (currentNode, nodeId) {
        if (currentNode.id === nodeId) {
            var resultNodeIndex = currentNode.children.indexOf(resultNode);
            currentNode.children.splice(resultNodeIndex, resultNodeIndex + 1);
            return currentNode;
        }
        else {
            var resultNode = null;
            for (var _i = 0, _a = currentNode.children; _i < _a.length; _i++) {
                var childNode = _a[_i];
                resultNode = this.removeNode(childNode, nodeId);
                if (resultNode && resultNode.id === nodeId) {
                    var resultNodeIndex = currentNode.children.indexOf(resultNode);
                    currentNode.children.splice(resultNodeIndex, resultNodeIndex + 1);
                }
            }
            return resultNode;
        }
    };
    HierarchyModel.prototype.add = function (newNode, nodeId) {
        var node = this.findNode(this.hierarchyRoot, nodeId);
        node.children.unshift(newNode);
    };
    HierarchyModel.prototype.remove = function (nodeId) {
        var node = this.removeNode(this.hierarchyRoot, nodeId);
    };
    HierarchyModel.prototype.collapseNode = function (nodeId) {
        var nodeToCollapse = this.findNode(this.hierarchyRoot, nodeId);
        nodeToCollapse.collapsed = !nodeToCollapse.collapsed;
        if (nodeToCollapse.collapsed) {
            this.hideChildren(nodeToCollapse);
        }
        else {
            this.showChildren(nodeToCollapse);
        }
    };
    HierarchyModel.prototype.updateNodeName = function (nodeId, newNodeName) {
        var node = this.findNode(this.hierarchyRoot, nodeId);
        node.name = newNodeName;
    };
    HierarchyModel.prototype.containsSubstring = function (str, substr) {
        return str.toLowerCase().indexOf(substr.toLowerCase()) !== -1;
    };
    HierarchyModel.prototype.findAsList = function (nameSubstring) {
        var _this = this;
        var result = [];
        this.iterate(this.hierarchyRoot, function (currentNode) {
            if (_this.containsSubstring(currentNode.name, nameSubstring)) {
                result.push(currentNode);
            }
        }, 0);
        return result;
    };
    HierarchyModel.prototype.findByCollapsingHierarchy = function (nameSubstring) {
        var _this = this;
        var hasVisibleChildren = function (node) {
            var result = false;
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var child = _a[_i];
            }
        };
        this.iterateFromTail(this.hierarchyRoot, function (child, parent) {
            if (child.children.length === 0) {
                if (_this.containsSubstring(child.name, nameSubstring)) {
                    child.visible = true;
                    parent.visible = true;
                }
                else {
                    child.visible = false;
                    parent.visible = false;
                }
            }
            else {
                if (child.visible) {
                    parent.visible = true;
                }
                else if (_this.containsSubstring(child.name, nameSubstring)) {
                    child.visible = true;
                    parent.visible = true;
                }
            }
        });
    };
    HierarchyModel.prototype.iterateFromTail = function (currentNode, callback) {
        for (var _i = 0, _a = currentNode.children; _i < _a.length; _i++) {
            var child = _a[_i];
            this.iterateFromTail(child, callback);
            callback(child, currentNode);
        }
    };
    return HierarchyModel;
}());
var HierarchyNode = (function (_super) {
    __extends(HierarchyNode, _super);
    function HierarchyNode(name, children) {
        this.name = name;
        this.id = generateUniqueHashId();
        this.children = children;
        this.visible = true;
        this.collapsed = false;
    }
    return HierarchyNode;
}(BaseNode));
// Notes Classes
var NoteNode = (function (_super) {
    __extends(NoteNode, _super);
    function NoteNode(name) {
        this.name = name;
        this.id = generateUniqueHashId();
        this.visible = true;
        this.content = "";
    }
    return NoteNode;
}(BaseNode));
var NoteMenuModel = (function () {
    function NoteMenuModel(noteList) {
        this.notes = this.convertJsonArrayToNoteArray(noteList);
    }
    NoteMenuModel.prototype.convertJsonArrayToNoteArray = function (noteList) {
        var notes = [];
        var noteNode;
        for (var _i = 0, noteList_1 = noteList; _i < noteList_1.length; _i++) {
            var note = noteList_1[_i];
            if (note.hasOwnProperty("name")) {
                noteNode = new NoteNode(note.name);
                if (note.hasOwnProperty("content")) {
                    noteNode.content = note.content;
                }
                notes.unshift(noteNode);
            }
        }
        return notes;
    };
    NoteMenuModel.prototype.add = function (note) {
        this.notes.unshift(note);
    };
    NoteMenuModel.prototype.remove = function (noteId) {
        var node = this.findNode(noteId);
        if (node) {
            var index = this.notes.indexOf(node);
            this.notes.splice(index, index + 1);
        }
    };
    NoteMenuModel.prototype.findNode = function (noteId) {
        for (var _i = 0, _a = this.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            if (note.id === noteId) {
                return note;
            }
        }
        return null;
    };
    NoteMenuModel.prototype.updateNoteContent = function (noteId, newContent) {
        var node = this.findNode(noteId);
        node.content = newContent;
    };
    return NoteMenuModel;
}());
var NoteMenuController = (function () {
    function NoteMenuController(noteMenuModel, noteMenuView) {
        this.noteMenuModel = noteMenuModel;
        this.noteMenuView = noteMenuView;
        this.display();
    }
    NoteMenuController.prototype.display = function () {
        this.noteMenuView.display(this.noteMenuModel);
        this.noteMenuView.initLogic(this);
    };
    NoteMenuController.prototype.edit = function (nodeId) {
        this.noteMenuView.edit(nodeId, this);
    };
    NoteMenuController.prototype.updateNodeName = function (nodeId, newNodeName) {
        this.noteMenuModel.updateNodeName(nodeId, newNodeName);
        this.display();
    };
    NoteMenuController.prototype.updateNoteContent = function (nodeId, newContent) {
        this.noteMenuModel.updateNoteContent(nodeId, newContent);
    };
    NoteMenuController.prototype.add = function (nodeId) {
        this.noteMenuModel.add(new NoteNode("New Note", []));
        this.display();
    };
    NoteMenuController.prototype.remove = function (nodeId) {
        this.noteMenuModel.remove(nodeId, String);
        this.display();
    };
    NoteMenuController.prototype.displayNote = function (nodeId) {
        this.noteMenuView.displayNote(nodeId, this);
    };
    NoteMenuController.prototype.findNote = function (noteId) {
        return this.noteMenuModel.findNode(noteId);
    };
    return NoteMenuController;
}());
var NoteMenuView = (function () {
    function NoteMenuView(noteMenuWindow) {
        this.noteMenuWindow = noteMenuWindow;
    }
    NoteMenuView.prototype.displayNoteMenuModelHTML = function (noteMenuModel) {
        var result = "";
        var notes = noteMenuModel.notes;
        for (var _i = 0, notes_1 = notes; _i < notes_1.length; _i++) {
            var note = notes_1[_i];
            result += this.displayNoteHTML(note);
        }
        return "<ul>" + result + "</ul>";
    };
    NoteMenuView.prototype.displayNoteHTML = function (node) {
        return this.generateNodeListElement(node.id, node.name);
    };
    NoteMenuView.prototype.generateNodeStyle = function () {
        return "style='width: 200px;'";
    };
    NoteMenuView.prototype.generateNodeListElement = function (nodeId, nodeName) {
        return "" +
            "<li " + this.generateNodeStyle() + ">" +
            "<div class='note' id='" + nodeId + "'>" +
            "<span class='note-name' " + this.generateNodeNameStyle() + ">" +
            nodeName +
            "</span>" +
            this.generateNodeButtons() +
            "</div>" +
            "</li>";
    };
    NoteMenuView.prototype.generateNodeNameStyle = function () {
        return "style='font-weight: bold;'";
    };
    NoteMenuView.prototype.generateNodeButtons = function () {
        return "" +
            "<div class='node-buttons'>" +
            "<span class='collapse'> collapse </span>|" +
            "<span class='edit'> edit </span>|" +
            "<span class='add'> add </span>|" +
            "<span class='remove'> remove </span>" +
            "</div>";
    };
    NoteMenuView.prototype.display = function (noteMenuModel) {
        this.noteMenuWindow.html(this.displayNoteMenuModelHTML(noteMenuModel));
    };
    NoteMenuView.prototype.initLogic = function (noteMenuController) {
        $(".note-name").on("click", function (e) {
            var nodeId = $(e.currentTarget).parents(".note")[0].id;
            console.log(nodeId);
            noteMenuController.displayNote(nodeId, noteMenuController);
        });
        $(".collapse").on("click", function (e) {
            var nodeId = $(e.currentTarget).parents(".note")[0].id;
            noteMenuController.collapseNode(nodeId);
        });
        $(".edit").on("click", function (e) {
            var nodeId = $(e.currentTarget).parents(".note")[0].id;
            noteMenuController.edit(nodeId);
        });
        $(".add").on("click", function (e) {
            var nodeId = $(e.currentTarget).parents(".note")[0].id;
            noteMenuController.add(nodeId);
        });
        $(".remove").on("click", function (e) {
            var nodeId = $(e.currentTarget).parents(".note")[0].id;
            noteMenuController.remove(nodeId);
        });
    };
    NoteMenuView.prototype.edit = function (nodeId, noteMenuController) {
        var node = $("#" + nodeId);
        var nodeName = node.find(".node-name").text();
        var html = "" +
            "<input placeholder='" + nodeName + "'>" +
            "<button class='save'>Save</button>" +
            "<button class='cancel'>Cancel</button>";
        node.html(html);
        node.find(".cancel").on("click", function () {
            noteMenuController.display();
        });
        node.find(".save").on("click", function () {
            var newNodeName = node.find("input").val();
            noteMenuController.updateNodeName(nodeId, newNodeName);
            noteMenuController.display();
        });
    };
    NoteMenuView.prototype.displayNote = function (noteId, noteMenuController) {
        var _this = this;
        var node = noteMenuController.noteMenuModel.findNode(noteId);
        console.log(node);
        if (node) {
            var notesArea = $("#notes-area");
            notesArea.html("<div class='note-view'>" +
                "<div class='note-content'></div>" +
                this.displayNoteContentButtons() +
                "</div>");
            $(".note-content").html(node.content);
        }
        $("#edit-note").on("click", function () {
            _this.displayEditor(noteId, noteMenuController);
        });
        $("#return-note").on("click", function () {
            noteMenuController.display();
        });
    };
    NoteMenuView.prototype.displayNoteContentButtons = function () {
        return "" +
            "<button id='edit-note'>Edit</button>" +
            "<button id='return-note'>Return</button>";
    };
    NoteMenuView.prototype.displayEditor = function (noteId, noteMenuController) {
        var _this = this;
        var note = noteMenuController.findNote(noteId);
        if (note) {
            var notesArea = $("#notes-area");
            notesArea.html("<div class='note-view'>" +
                "<textarea class='note-editor'></textarea>" +
                this.displayNoteEditorButtons() +
                "</div>");
            $(".note-editor").val(note.content);
        }
        $("#save-note").on("click", function () {
            var newContent = $(".note-editor").val();
            noteMenuController.updateNoteContent(noteId, newContent);
            _this.displayNote(noteId, noteMenuController);
        });
        $("#cancel-note").on("click", function () {
            noteMenuController.display();
        });
    };
    NoteMenuView.prototype.displayNoteEditorButtons = function () {
        return "" +
            "<button id='save-note'>Save</button>" +
            "<button id='cancel-note'>Cancel</button>";
    };
    return NoteMenuView;
}());
var hierarchyModel = new HierarchyModel({
    name: "ROOT",
    id: generateUniqueHashId(),
    collapsed: false,
    visible: true,
    children: []
});
var hierarchyView = new HierarchyView($("#hierarchy-area"));
var hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);
var noteMenuModel = new NoteMenuModel([
    {
        name: "Note001",
        id: generateUniqueHashId(),
        content: "Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor..."
    }
]);
var noteMenuView = new NoteMenuView($("#notes-area"));
var noteMenuController = new NoteMenuController(noteMenuModel, noteMenuView);
// Node Unit Tests
exports.NOTE_MENU_JsonToListTest = function (test) {
    var noteMenuModel = new NoteMenuModel([{
            name: "note001",
            id: generateUniqueHashId(),
            visible: true,
            articleId: null,
            labelIds: []
        }]);
    var noteNode = new NoteNode("note001", []);
    test.notEqual(noteMenuModel.notes[0].id, noteNode.id);
    noteMenuModel.notes[0].id = "";
    noteNode.id = "";
    test.deepEqual(noteMenuModel.notes[0], noteNode);
    test.done();
};
exports.NOTE_MENU_MODEL_AddTest = function (test) {
    var noteMenuModel = new NoteMenuModel({
        name: "note001",
        id: generateUniqueHashId(),
        visible: true,
        articleId: null,
        labelIds: []
    });
    var newNode = new NoteNode("node002");
    noteMenuModel.add(newNode);
    test.deepEqual(newNode, noteMenuModel.notes[0]);
    test.done();
};
exports.NOTE_MENU_MODEL_RemoveTest = function (test) {
    console.log("hello world");
    var noteMenuModel = new NoteMenuModel({
        name: "note001",
        id: generateUniqueHashId(),
        visible: true,
        articleId: null,
        labelIds: []
    });
    var newNode = new NoteNode("node002");
    noteMenuModel.add(newNode);
    noteMenuModel.remove(newNode.id);
    test.ok(0 === noteMenuModel.notes.length);
    test.done();
};
exports.NOTE_MENU_MODEL_UpdateNoteContent = function (test) {
    var noteMenuModel = new NoteMenuModel({
        name: "note001",
        id: generateUniqueHashId(),
        visible: true,
        articleId: null,
        labelIds: []
    });
    var newNode = new NoteNode("node002");
    noteMenuModel.add(newNode);
    noteMenuModel.updateNoteContent(newNode.id, "Content");
    test.equals("Content", noteMenuModel.notes[0].content);
    test.done();
};
exports.HIERARCHY_MODEL_JsonToTreeTest = function (test) {
    var hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    var hierarchyNode = new HierarchyNode("node001", []);
    test.notEqual(hierarchyModel.hierarchyRoot.id, hierarchyNode.id);
    hierarchyModel.hierarchyRoot.id = "";
    hierarchyNode.id = "";
    test.deepEqual(hierarchyModel.hierarchyRoot, hierarchyNode);
    test.done();
};
exports.HIERARCHY_MODEL_AddTest = function (test) {
    var hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    var newNode = new HierarchyNode("node002", []);
    hierarchyModel.add(newNode, hierarchyModel.hierarchyRoot.id);
    test.deepEqual(newNode, hierarchyModel.hierarchyRoot.children[0]);
    test.done();
};
exports.HIERARCHY_MODEL_RemoveTest = function (test) {
    var hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    var newNode = new HierarchyNode("node002", []);
    hierarchyModel.add(newNode, hierarchyModel.hierarchyRoot.id);
    hierarchyModel.remove(newNode.id); // TODO: Change Node Name to Unique ID!
    test.deepEqual(0, hierarchyModel.hierarchyRoot.children.length);
    test.done();
};
exports.HIERARCHY_MODEL_UpdateNode = function (test) {
    var id = generateUniqueHashId();
    var hierarchyModel = new HierarchyModel({
        name: "node001",
        id: id,
        collapsed: false,
        visible: true,
        children: []
    });
    hierarchyModel.updateNodeName(hierarchyModel.hierarchyRoot.id, "Test");
    test.done();
};
exports.HIERARCHY_CONTROLLER_FindAsList = function (test) {
    var id = generateUniqueHashId();
    var hierarchyModel = new HierarchyModel({
        name: "node001",
        id: id,
        collapsed: false,
        visible: true,
        children: []
    });
    var hierarchyView = new HierarchyView($(""));
    var hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);
    var newNode = new HierarchyNode("node002", []);
    hierarchyController.add(newNode, hierarchyModel.hierarchyRoot.id);
    var results = hierarchyController.findAsList("node");
    test.equals(2, results.length);
    results = hierarchyController.findAsList("001");
    test.equals(1, results.length);
    results = hierarchyController.findAsList("003");
    test.equals(0, results.length);
    test.done();
};
exports.HIERARCHY_CONTROLLER_FindByCollapsingHierarchy = function (test) {
    var id = generateUniqueHashId();
    var hierarchyModel = new HierarchyModel({
        name: "node001",
        id: id,
        collapsed: false,
        visible: true,
        children: []
    });
    var hierarchyView = new HierarchyView($(""));
    var hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);
    var node002 = new HierarchyNode("node002", []);
    hierarchyController.add(node002, hierarchyModel.hierarchyRoot.id);
    hierarchyController.findByCollapsingHierarchy("test");
    test.equals(false, hierarchyModel.hierarchyRoot.visible);
    test.equals(false, hierarchyModel.hierarchyRoot.visible);
    hierarchyController.display();
    var node003 = new HierarchyNode("Test", []);
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
};
exports.HIERARCHY_VIEW_JsonToDOMTreeTest = function (test) {
    var nodeId001 = "";
    var nodeId002 = "";
    var nodeId003 = "";
    var nodeId004 = "";
    var hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    nodeId001 = hierarchyModel.hierarchyRoot.id;
    var html = "";
    var hierarchyView = new HierarchyView($());
    html = "" +
        "<ul>" +
        hierarchyView.generateNodeListElement(nodeId001, "node001") +
        "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    var node002 = new HierarchyNode("node002", []);
    nodeId002 = node002.id;
    hierarchyModel.add(node002, nodeId001);
    html = "<ul>" +
        hierarchyView.generateNodeListElement(nodeId001, "node001") +
        "<ul>" +
        hierarchyView.generateNodeListElement(nodeId002, "node002") +
        "</ul>" +
        "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    var node003 = new HierarchyNode("node003", []);
    nodeId003 = node003.id;
    hierarchyModel.add(node003, nodeId002);
    html = "<ul>" +
        hierarchyView.generateNodeListElement(nodeId001, "node001") +
        "<ul>" +
        hierarchyView.generateNodeListElement(nodeId002, "node002") +
        "<ul>" +
        hierarchyView.generateNodeListElement(nodeId003, "node003") +
        "</ul>" +
        "</ul>" +
        "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    var node004 = new HierarchyNode("node004", []);
    nodeId004 = node004.id;
    hierarchyModel.add(node004, nodeId001);
    html = "<ul>" +
        hierarchyView.generateNodeListElement(nodeId001, "node001") +
        "<ul>" +
        hierarchyView.generateNodeListElement(nodeId004, "node004") +
        hierarchyView.generateNodeListElement(nodeId002, "node002") +
        "<ul>" +
        hierarchyView.generateNodeListElement(nodeId003, "node003") +
        "</ul>" +
        "</ul>" +
        "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    hierarchyModel.remove(nodeId004);
    html = "<ul>" +
        hierarchyView.generateNodeListElement(nodeId001, "node001") +
        "<ul>" +
        hierarchyView.generateNodeListElement(nodeId002, "node002") +
        "<ul>" +
        hierarchyView.generateNodeListElement(nodeId003, "node003") +
        "</ul>" +
        "</ul>" +
        "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    test.done();
};
exports.HIERARCHY_AUX_ToLowerSerpentTest = function (test) {
    var input;
    var result;
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
