//Vue.config.devtools = true;
function getContent(url, methodType = 'GET', callback) {
    let xhr = new XMLHttpRequest();
    xhr.open(methodType, url, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                ////console.log("xhr done successfully");
                let resp = xhr.responseText;
                // var respJson = JSON.parse(resp);
                // //console.log(respJson);
                // return respJson;
                if (typeof callback === "function") {
                    // apply() sets the meaning of "this" in the callback
                    callback.apply(xhr);
                }
            } else {
               //// console.log("xhr failed");
            }
        } else {
           //// console.log("xhr processing going on");
        }
    }
    //// console.log("request sent succesfully");
}

Vue.component('partabs', {
    template: `
    <div>
        <div class="tabs is-centered is-toggle navbar is-toggle-rounded">
            <ul>
                <li v-for="tab in chitabs" :class="{'is-active': tab.isActive}"><a @click="selectTab(tab)" :href="'#'+tab.title">{{tab.title}}</a></li>
            </ul>
        </diV>
        <div class='tab-details'>
            <slot></slot>
        </div>

    </div>
    `,
    data() {
        return {
            chitabs: []
        };
    },
    created() {
        this.chitabs = this.$children;
    },
    methods: {
        selectTab: function (selectedtab) {
            this.chitabs.forEach(tab => {
                    tab.isActive = (tab.title == selectedtab.title);
                    //
                    //  This simulates function execution, one after another through the heirarchy
                    //1. Loops through titles on 'chitab' component, if it matches the one clicked
                    //  a.Executes the setChildActive() function in 'chitab' component
                    //2. setChildActive() then follows through to execute selectDef() function on the first child in 'tabs' component
                    //  a.selectDef uses the selectTab() function with the first child element of its 'tab' component
                    //  b.which simulates clicking of the first tab in the 'tab' component
                    //
                    if(tab.title == selectedtab.title)
                        tab.setChildActive();
            });
        }
    }

});
Vue.component('chitab', {
    template: `
    <div v-show="isActive" class='tab-details'>
        <slot></slot>
    </div>
    `,
    props: {
        title: {
            required: true
        },
        selected: {
            default: false
        }
    },
    data() {
        return {
            isActive: false,
        }
    },
    mounted() {
        this.isActive = this.selected;
    },
    methods:{   
        setChildActive: function(){
            this.$children[0].selectDef();
        }
    }
});

Vue.component('tabs', {
    template: `
    <div class="content childcontent">
        <div class="tabs child is-centered is-toggle navbar is-toggle-rounded">
            <ul>
                <li v-for="tab in tabs" :class="{'is-active': tab.isActive}"><a @click="selectTab(tab)" :href="'#'+tab.title">{{tab.title}}</a></li>
            </ul>
        </div>
        <div class='tab-details'>
            <slot></slot>
        </div>
    </div>
    `,
    data() {
        return {
            tabs: [],
            isActive: false
        };
    },
    created() {
        this.tabs = this.$children;
    },
    methods: {
        selectTab: function (selectedtab) {
            this.tabs.forEach(tab => {
                tab.isActive = (tab.name == selectedtab.name);
                if (!tab.isLoaded) {
                    if (tab.name == selectedtab.name) {
                        tab.setData();
                    }
                }
                if(tab.name == selectedtab.name){
                    tab.current = true;
                    if (tab.isLoaded && tab.isActive && tab.current){
                        tab.setVoice();
                    }
                }
            });
        },
        selectDef:function(){
            //console.log('run selectDef');
            //console.log(this.name,this.$children[0].name)
            this.selectTab(this.$children[0]);
        }
    }
});

Vue.component('tab', {
    template: `
    <div :id="this.name.toLowerCase()" v-show="isActive" class='tab-details'>
        <ul>
        <li v-for="link,index in this.linklist"><span class="itm">{{index+1}}</span><a v-if="link.rurl" target="_blank" :href="link.rurl">[{{link.score}}]</a><a target="_blank" :href="link.url">{{htmlDecode(link.title)}}</a><span class="del" @click="remove(index)">✖</span></li>
        </ul>
        <slot></slot>
    </div>
    `,
    props: {
        name: {
            required: true
        },
        selected: {
            default: false
        },
        title: {
            required: true
        },
        voice:{
            default:false
        }
    },
    data() {
        return {
            isActive: false,
            isLoaded: false,
            current: this.voice,
            linklist: []
        }
    },
    created() {
        //comment this line so all tab and voice load only when they are clicked
        this.isActive = this.selected;
    },
    updated() {
        //runs twice, needs debug
        //console.log('@tab:updated',this.name, this.$parent.isActive)
        if (this.$parent.isActive && this.isActive && !this.isLoaded){
            this.current = true;
            this.setData();
            this.setVoice();
        }
        if (this.linklist.length != 0)
            this.isLoaded = true;
        if (this.current)
            this.setVoice();
    },
    beforeMount() {
        if (!this.isLoaded)
            this.setData();
    },
    methods: {
        setData: function () {
            if (this.isActive) {
                let now = this;
                let filename = 'temp/' + this.name.toLowerCase() + '-parsed.json';
                getContent(filename, 'GET', function () {
                    now.linklist = JSON.parse(this.responseText);
                    //prompt(now.linklist);
                });
            }
        },
        setVoice: function (){
            if (this.current && this.isActive) {
                this.$root.voice = this.linklist;
            }
        },
        remove: function (index) {
            this.$delete(this.linklist, index)
        },
        htmlDecode: function (str) {
            const doc = new DOMParser().parseFromString(str, "text/html");
            return doc.documentElement.textContent;
        }
           
    }
});
Vue.component('voice', {
    template:`
<div v-show="showFab" class="voice-section">
<div class="fab">
    <div class="settings" @click="settingsShown = !settingsShown">⚙️</div>

    <div class="player"><span @click="stopSpeak" v-show="stopShown" class="stop">⏹</span><span @click="speaker" class="play" v-text="playpause">▶</span></div>
</div>
<div v-if="settingsShown" id="vsettings">
<span @click="settingsShown = !settingsShown" class="close">x</span>
    <form>
        <select  v-model="selectedVoice">
        <option v-for="(voice,index) in this.voices" :value="index" :data-lang="voice.lang" :data-name="voice.name">{{voice.name}}</option>
        </select>
        <div>
          <label for="rate">Rate</label><input type="range" min="0.5" max="2" v-model="rate" step="0.1" id="rate">
          <span v-text="rate">1</span>
        </div>
        <div>
          <label for="pitch">Pitch</label><input type="range" min="0" max="2" v-model="pitch" step="0.1" id="pitch">
          <span v-text="pitch">1</span>
        </div>
        <div>
        <label for="separator">Separator</label><input v-model="separator" :value='separator'></input>
        </div>
        <div>
        <label for="startItem">Start</label><input v-model.number="startItem" type="number" min="1" max="99" :value='startItem' size="2"></input>
        <label for="endItem">End</label><input v-model.number="endItem" type="number" min="2" max="100" :value='endItem' size="2"></input>
        </div>
    </form>
</div>
</div>
    `,
    data(){
        return{
            settingsShown: false,
            stopShown: false,
            showFab: true,
            playpause: '▶',
            speak: [],
            pitch: 1,
            rate: 1,
            separator: '.... and in other news ....',
            synth: window.speechSynthesis,
            voices: [],
            selectedVoice : 0,
            startItem: 1,
            endItem: 25

        }
    },
    mounted(){
        //check if browser support speech synthesis
        if ('speechSynthesis' in window){
            this.loadVoices();
            this.synth.cancel();
            window.addEventListener('scroll', this.onScroll);
        }else{
            this.showFab = false;
        }
    },
    beforeDestroy () {
        window.removeEventListener('scroll', this.onScroll)
    },
    methods:{
        loadVoices: function(){
            //https://stackoverflow.com/a/52005323
            function setSpeech() {
                return new Promise(
                    function (resolve, reject) {
                        let synth = window.speechSynthesis;
                        let id;
            
                        id = setInterval(() => {
                            if (synth.getVoices().length !== 0) {
                                resolve(synth.getVoices());
                                clearInterval(id);
                            }
                        }, 10);
                    }
                )
            }
            let s = setSpeech();
            //s.then((voices) => console.log(voices)); 
            s.then((voices) => {
                this.voices = this.synth.getVoices();
                //this.voices.forEach(e=>{console.log(e.lang,e.name)});
            });
            
        },
        speaker:function(){
            //https://github.com/mdn/web-speech-api/tree/master/speak-easy-synthesis
            this.speak = this.$root.voice.map(x => x.title);
            if (this.synth.speaking && !this.synth.paused) {
                this.synth.pause();
                this.playpause = '▶';
                //console.log('speechSynthesis.paused');
                return;
            }
            if (this.synth.paused && this.synth.speaking) {
                this.synth.resume();
                this.playpause = '▶';
                //console.log('speechSynthesis.resumed');
                return;
            }
            if(this.speak.length > 0){
                let utterThis = new SpeechSynthesisUtterance(this.speak.slice(this.startItem-1,this.endItem).join(this.separator));
                this.stopShown = true;
                    now = this;
                    utterThis.onend = function (event) {
                        now.stopSpeak();
                        //console.log('SpeechSynthesisUtterance.onend');
                    }
                    utterThis.onerror = function (event) {
                        console.error('SpeechSynthesisUtterance.onerror');
                    }
                    utterThis.voice = this.voices[this.selectedVoice];
                    utterThis.pitch = this.pitch;
                    utterThis.rate = this.rate;
                    this.playpause = '⏸';
                    this.synth.speak(utterThis);
            }

        },
        stopSpeak:function(){
                this.synth.cancel();
                this.playpause = '▶';
                this.stopShown = false;
                //console.error('speechSynthesis.speaking');
        },
        onScroll: function(){
            this.showFab = (window.innerHeight + window.scrollY) != document.body.offsetHeight;
        }
    }

});

let vm = new Vue({
    el: '#app',
    data(){
        return {
            voice:[]
        }
    }
});