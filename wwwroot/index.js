var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./merger", "./models/MonacoContent"], function (require, exports, merger_1, MonacoContent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MyApp {
        constructor() {
            this.password = 'maddy';
            this.title = 'Code Interview App';
            this.post_count = 1;
            this.edit_mode = false;
            this.run_updates = true; //running and stopped button
            this.stop_updates = false; //running and stopped button
            this.message = '';
            this.id = 0;
            this.name = '';
            this.num_viewers = 0;
            this.num_editors = 0;
            this.min_height = 400;
            this.height = 0;
            this.ready_to_update = true; //prevent too many api calls during network congestion
            //co-authoring support
            this.lastContent = null;
            this.did_code_change = false;
            this.show_warning = false;
            this.update_counter = 0;
            this.update_interval = 0;
            this.current_version = 0;
            this.users = [];
            //mobile device support
            this.mobile_device = false;
            this.decorations = [];
            this.setId();
            this.bindRivets();
            this.calculateInitialHeight();
            this.detectMobileDevice();
            this.setHeight();
            require(['vs/editor/editor.main'], function () {
                var myApp = window["myApp"];
                var options = {};
                options.value = 'loading...';
                options.language = 'javascript';
                options.theme = 'vs-light';
                options.automaticLayout = true;
                options.readOnly = true;
                options.mouseWheelZoom = true;
                options.glyphMargin = true;
                if (myApp.mobile_device) {
                    options.glyphMargin = false;
                    options.contextmenu = false;
                    // options.wordWrap = "on";
                    // options.minimap = <monaco.editor.IEditorMinimapOptions>{
                    //     enabled: false
                    // }
                }
                myApp.editor = monaco.editor.create(document.getElementById('monContainer'), options);
                document.getElementById('loadingDiv').style.display = 'none';
                $("#exampleModal").modal();
                setTimeout(() => {
                    $("#txtName").focus();
                }, 500);
                //init tooltips
                // ($('[data-toggle="tooltip"]') as any).tooltip();
            });
        }
        initializeTooltips() {
            $('[data-toggle="tooltip"]').tooltip();
        }
        refreshTooltips() {
            let viewer_names = '';
            let editor_names = '';
            this.users.forEach((user) => {
                if (user.is_editor)
                    editor_names += user.name + ', ';
                else
                    viewer_names += user.name + ', ';
            });
            if (viewer_names.endsWith(', '))
                viewer_names = viewer_names.substr(0, viewer_names.length - 2);
            if (editor_names.endsWith(', '))
                editor_names = editor_names.substr(0, editor_names.length - 2);
            $('#spanViewers').attr('data-original-title', viewer_names);
            $('#spanEditors').attr('data-original-title', editor_names);
        }
        showApp() {
            let form = document.getElementById('nameForm');
            {
                let isvalid = form.checkValidity();
                if (isvalid) {
                    document.getElementById('divMain').style.display = 'block';
                    this.name = $("#txtName").val();
                    this.update();
                    //ping server every 5 seconds
                    setInterval(() => this.update(), 5000);
                    $('#exampleModal').modal('hide');
                    this.initializeTooltips();
                }
                form.classList.add('was-validated');
            }
        }
        calculateInitialHeight() {
            this.height = window.innerHeight - 400;
            if (this.height < this.min_height)
                this.height = this.min_height;
        }
        detectMobileDevice() {
            if (window.innerWidth < 500) {
                document.getElementById('monContainer').style['margin-right'] = '10px';
                document.getElementById('monContainer').style['margin-left'] = '10px';
                this.title = 'Code Interview';
                this.mobile_device = true;
            }
        }
        heightGrow() {
            this.height += 100;
            this.setHeight();
        }
        heightShrink() {
            this.height -= 100;
            this.setHeight();
        }
        chkEditCodeChanged() {
            // myApp.editor.updateOptions({readOnly:true})
            setTimeout(() => {
                this.editor.updateOptions({ readOnly: !this.edit_mode });
            }, 50);
        }
        setHeight() {
            document.getElementById('monContainer').style['min-height'] = this.height + 'px';
            document.getElementById('monContainer').style['max-height'] = this.height + 'px';
        }
        setId() {
            this.id = Math.floor(Math.random() * Math.floor(1000000));
            console.log('ID: ' + this.id);
        }
        bindRivets() {
            rivets.bind($('body'), { data: this });
        }
        btnClick() {
            this.getMonacoContent();
        }
        stopUpdate() {
            if (this.run_updates) {
                this.run_updates = false;
                this.stop_updates = true;
                console.log('updating stopped');
            }
            else {
                this.run_updates = true;
                this.stop_updates = false;
                console.log('updating started');
            }
        }
        btnPost() {
            this.setMonacoContent();
        }
        btnRunCode() {
            try {
                eval(this.editor.getValue() + '  myApp.message = Run();');
            }
            catch (error) {
                console.log('Error: ' + error);
                this.message = 'Error: ' + error;
            }
        }
        updateTimer() {
            this.update_counter = 5;
            if (this.update_interval != 0)
                clearInterval(this.update_interval);
            this.update_interval = setInterval(() => this.update_counter--, 1000);
        }
        update() {
            return __awaiter(this, void 0, void 0, function* () {
                this.updateTimer();
                if (this.ready_to_update == false) //last update didn't finish
                 {
                    console.log('last update didnt finish');
                    return;
                }
                this.ready_to_update = false; //prevent multiple updates if last one didn't finish
                try {
                    this.did_code_change = false;
                    if (!this.run_updates) {
                        this.ready_to_update = true;
                        return;
                    }
                    if (this.edit_mode) //edit code mode
                     {
                        if (this.lastContent == null) {
                            this.lastContent = this.editor.getValue();
                            this.did_code_change = true;
                        }
                        else {
                            if (this.lastContent != this.editor.getValue())
                                this.did_code_change = true;
                        }
                        if (this.did_code_change) //only post updates to server if something changed
                            yield this.setMonacoContent();
                        else
                            yield this.getMonacoContent();
                        this.lastContent = this.editor.getValue();
                    }
                    else //view code mode
                     {
                        yield this.getMonacoContent();
                        this.lastContent = null;
                    }
                    this.post_count++;
                    //Test of ready_to_update functionality
                    //Pausing for 15 seconds to simulate network congestion
                    //await new Promise<void>(resolve => {setTimeout(resolve, 15000); }); 
                }
                catch (error) {
                    console.log('update error', error);
                }
                this.ready_to_update = true;
                this.showMessages();
                this.drawCoAuthoringMarkers();
            });
        }
        drawCoAuthoringMarkers() {
            var editors = [];
            if (this.num_editors > 0) {
                this.users.forEach(user => {
                    if (user.is_editor && user.id != this.id) {
                        editors.push({
                            range: new monaco.Range(user.line_number, 1, user.line_number, 1),
                            options: {
                                isWholeLine: true,
                                className: 'myContentClass',
                                glyphMarginClassName: 'myGlyphMarginClass'
                            }
                        });
                    }
                });
                this.decorations = this.editor.deltaDecorations(this.decorations, editors);
            }
            else {
                this.decorations = this.editor.deltaDecorations(this.decorations, editors);
            }
        }
        showMessages() {
            if (this.num_editors > 1 && this.edit_mode && !this.mobile_device)
                this.show_warning = true;
            else
                this.show_warning = false;
            // console.log('current version: ' + this.current_version);
        }
        getMonacoContent() {
            return __awaiter(this, void 0, void 0, function* () {
                // console.log('get content');
                let out_of_sync = false;
                if (this.current_version == -1)
                    out_of_sync = true;
                //there is some bug in here where if the other guy leaves
                //and you start making edits it says
                //merging content even though you should've had latest
                let current_content = this.editor.getValue();
                var result = yield $.get('api/values/GetMonacoContent?password=' + this.password + '&id=' + this.id
                    + '&is_editing=' + this.edit_mode + '&line_number=' + this.editor.getPosition().lineNumber
                    + '&name=' + this.name);
                this.num_editors = result.num_editors;
                this.num_viewers = result.num_viewers - result.num_editors;
                this.users = result.users;
                this.refreshTooltips();
                //don't overwrite if nothing changed
                if (this.editor.getValue() != result.content) {
                    //also don't update the code in the unlikely chance that the editor changed
                    //between the time it took to get the new content from the server
                    let can_update = true;
                    if (this.edit_mode && current_content != this.editor.getValue())
                        can_update = false;
                    if (can_update) {
                        this.current_version = result.current_version; //need to set the right key
                        let oldposition = this.editor.getPosition();
                        if (out_of_sync) //don't have the latest version, attempt merge
                         {
                            this.mergeContent(result.content);
                        }
                        else
                            this.editor.setValue(result.content);
                        this.editor.setPosition(oldposition); //prevent cursor from jumping
                    }
                }
                else
                    this.current_version = result.current_version; //nothing changed so give the user
                //their token
            });
        }
        //point of no return
        //whatever gets merged will
        //end up as the authoritative
        //record on the backend
        mergeContent(content) {
            return __awaiter(this, void 0, void 0, function* () {
                let content1 = this.editor.getValue();
                let content2 = content;
                if (content1 != content2) {
                    //try to merge content1 and content2
                    let merged_content = merger_1.Merger.MergeContent(content1, content2);
                    this.editor.setValue(merged_content);
                    yield this.setMonacoContent(); //send merged content up to the server immediately
                    //this needs to be here just in case they shut off the edit code
                    //checkbox right after they are done making their edit
                    console.log('finished merge');
                }
                else
                    console.log('nothing to merge');
            });
        }
        setMonacoContent() {
            return __awaiter(this, void 0, void 0, function* () {
                // console.log('set content');
                let mon_content = new MonacoContent_1.MonacoContent();
                mon_content.content = this.editor.getValue();
                mon_content.current_version = this.current_version;
                mon_content.password = this.password;
                mon_content.id = this.id;
                mon_content.name = this.name;
                mon_content.line_number = this.editor.getPosition().lineNumber;
                var result = yield $.ajax({
                    url: 'api/values/PostMonacoContent',
                    headers: { 'Content-Type': "application/json" },
                    method: "POST",
                    data: JSON.stringify(mon_content)
                });
                this.num_editors = result.num_editors;
                this.num_viewers = result.num_viewers - result.num_editors;
                this.users = result.users;
                this.current_version = result.current_version;
                this.refreshTooltips();
            });
        }
    }
    exports.MyApp = MyApp;
    window["myApp"] = new MyApp();
});
//# sourceMappingURL=index.js.map