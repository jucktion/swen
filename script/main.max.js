Vue.config.devtools = true;
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

// Grab the reddit domain, if not assigned, use official domain
// Not used in a vue component because this only needs to happen once.
let url = new URL(document.URL);
let rd = (url.searchParams.get("r")) ? 'https://' + url.searchParams.get("r") : 'https://reddit.com';
let lang = (url.searchParams.get("l") === null) ? navigator.language : (url.searchParams.get("l") == '') ? navigator.language : (url.searchParams.get("l").length > 0) ? url.searchParams.get("l") : '';
let hash = (window.location.hash != '') ? window.location.hash.split('#')[1].split(',') : '';
let h1 = (hash.length >= 1) ? hash[0].toLowerCase() : '';
let h2 = (hash.length >= 2) ? hash[1].toLowerCase() : '';

Vue.component('partabs', {
    template: `
    <div>
        <div class="tabs is-centered is-toggle navbar is-toggle-rounded">
            <ul>
                <li v-for="tab in chitabs" :class="{'is-active': tab.isActive}"><a @click="selectTab(tab)" :href="'#'+tab.title.toLowerCase()">{{tab.title}}</a></li>
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
    mounted() {
        this.hashActivate();
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
                if (tab.title == selectedtab.title) {
                    tab.setChildActive();

                }

            });
        },
        hashActivate: function () {
            if (h1 != '') {
                this.chitabs.forEach(tab => {
                    if (tab.title.toLowerCase() == h1) {
                        tab.isActive = tab.selected = true;
                        if (h2 == '')
                            tab.setChildActive();

                    }

                });
            }
            else if (h1 == '' && h2 == '') {
                this.chitabs[0].isActive = this.chitabs[0].selected = true;
                this.chitabs[0].setChildActive();
            }

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
    methods: {
        setChildActive: function () {
            this.$children[0].selectDef();
        }
    }
});

Vue.component('tabs', {
    template: `
    <div class="content childcontent">
        <div class="tabs child is-centered is-toggle navbar is-toggle-rounded">
            <ul>
                <li v-for="tab in filterTab(tabs)" :class="{'is-active': tab.isActive}"><a :href="'#'+tab.$parent.$parent.title.toLowerCase()+tab.tag.toLowerCase()" @click="selectTab(tab)">{{tab.title}}</a></li>
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
    mounted() {
        if (h2.length > 1)
            this.hashActivate();

        this.filterTab(this.tabs);
    },
    methods: {
        selectTab: function (selectedtab) {
            this.tabs.forEach(tab => {
                tab.isActive = tab.current = (tab.name == selectedtab.name);
                if (tab.name == selectedtab.name) {
                    if (!tab.isLoaded) {
                        tab.setData();
                    }
                    tab.current = true;;
                    if (tab.isLoaded && tab.isActive && tab.current) {
                        tab.setVoice();
                    }
                }
            });
        },
        filterTab: function (tabs) {
            //tabs[0].name = '';
            this.tags = this.tabs;
            this.tags.forEach((tab, index) => { tab.tag = (index == 0) ? '' : ',' + tab.name; });

            return this.tags;
        },
        hashActivate: function () {
            if (h2 != '') {
                this.tabs.forEach(tab => {
                    tabname = tab.name;
                    //Cannot just loop through current tab children for some reason.
                    //Can change the mounted() function to updated() or beforeUpdate to get parent state to true or false 
                    //but breaks
                    //console.log(h2, tabname, tab.$parent.$parent.title, tab.$parent.$parent.selected, this.tabs.length);
                    tab.isActive = tab.current = (tabname == h2);
                    if (tabname == h2) {

                        if (tabname == h2) {
                            if (!tab.isLoaded) {
                                tab.setData();
                            }
                            tab.current = true;;
                            if (tab.isLoaded && tab.isActive && tab.current) {
                                tab.setVoice();
                            }
                        }
                    }
                });
            }
            else {
                this.tabs[0].isActive = this.tabs[0].selected = true;
            }

        },
        selectDef: function () {
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
        <li v-for="link,index in this.linklist">
        <span class="itm">{{index+1}}</span>
        <a v-if="link.rurl" rel="noopener, noreferrer" target="_blank" :href="rd + link.rurl">[{{link.score}}]</a>
        <a v-if="link.com" rel="noopener, noreferrer" target="_blank" :href="link.com">[{{link.score}}]</a>
        <a  rel="noopener, noreferrer" target="_blank" :href="link.url">{{htmlDecode(link.title)}}</a><span class="del" @click="remove(index)">x</span></li>
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
        voice: {
            default: false
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
        if (this.$parent.isActive && this.isActive && !this.isLoaded) {
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
        setVoice: function () {
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
    template: `
<div v-show="showFab" class="voice-section">
<div class="fab">
    <div class="settings" @click="settingsShown = !settingsShown"><img src="/img/settings.svg" alt="Voice settings"></div>

    <div class="player"><span @click="stopSpeak" v-show="stopShown" class="stop"><img src="/img/stop.svg" alt="Stop Player"></span><span @click="speaker" class="play"><img :src="svg"></span></div>
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
        <label for="startItem">Start: </label><span v-text="startItem">1</span><input v-model.number="startItem" type="range" min="1" :max="endItem" :value='startItem' size="2"></input>
        <label for="endItem">End: </label><span v-text="endItem ">1</span><input v-model.number="endItem" type="range" :min="startItem" max="25" :value='endItem' size="1"></input>
        </div>
    </form>
</div>
</div>
    `,
    data() {
        return {
            settingsShown: false,
            stopShown: false,
            showFab: false,
            svg: '/img/play.svg',
            speak: [],
            saythis: null,
            pitch: 1,
            rate: 1,
            separator: '.... and in other news ....',
            synth: window.speechSynthesis,
            voices: [],
            selectedVoice: 0,
            startItem: 1,
            endItem: 25
        }
    },
    mounted() {
        //check if browser support speech synthesis, if it does, display the TTS FAB. 
        this.showFab = ('speechSynthesis' in window);
        if (this.showFab) {
            this.loadVoices();
            this.synth.cancel();
        }
        //since hiding FAB onScroll function isn't working, disable it on mobile devices
        let mq = window.matchMedia("(max-width: 512px)").matches;
        if (!mq)
            window.addEventListener('scroll', this.onScroll);
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.onScroll)
    },
    methods: {
        loadVoices: function () {
            //https://stackoverflow.com/a/52005323
            function setSpeech() {
                return new Promise(
                    function (resolve, reject) {
                        let id;
                        id = setInterval(() => {
                            if (window.speechSynthesis.getVoices().length !== 0) {
                                resolve(window.speechSynthesis.getVoices());
                                clearInterval(id);
                            }
                        }, 10);
                    }
                )
            }
            let s = setSpeech();
            //s.then((voices) => console.log(voices)); 
            s.then((voices) => {
                this.voices = (lg) ? voices.filter(function (voice) {
                    return voice.lang.indexOf(lang) != -1;
                }) : voices;
                //this.voices.forEach(e=>{console.log(e.lang,e.name)});
            });
        },
        speaker: function () {
            //https://github.com/mdn/web-speech-api/tree/master/speak-easy-synthesis
            if (this.saythis == null && !this.synth.speaking) {
                this.speak = this.$root.voice.map(x => x.title);
                this.saythis = this.speak.slice(this.startItem - 1, this.endItem).join(this.separator);
            }

            if (this.synth.speaking && !this.synth.paused) {
                this.synth.pause();
                this.playPause(0);
                return;
                //console.log('speechSynthesis.paused');
            }
            else if (this.synth.paused && this.synth.speaking) {
                this.synth.resume();
                this.playPause(1);
                return;
                //console.log('speechSynthesis.resumed');    
            }
            else if (!this.synth.paused && this.saythis != null) {
                let utterThis = new SpeechSynthesisUtterance(this.saythis);
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
                this.synth.speak(utterThis);
                this.playPause(1);
            }
        },
        stopSpeak: function () {
            this.synth.cancel();
            this.stopShown = false;
            this.saythis = null;
            this.playPause(0);
            //console.error('speechSynthesis.speaking');
        },
        playPause: function (talking) {
            this.svg = talking == 0 ? '/img/play.svg' : '/img/pause.svg';
        },
        onScroll: function () {
            this.showFab = (window.innerHeight + window.scrollY) != document.body.offsetHeight;
        }
    }

});

let vm = new Vue({
    el: '#app',
    data() {
        return {
            voice: []
        }
    }
});