Vue.config.devtools = true;
function getContent(url, methodType = 'GET', callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(methodType, url, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                ////console.log("xhr done successfully");
                var resp = xhr.responseText;
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
function htmlDecode(str) {
    const doc = new DOMParser().parseFromString(str, "text/html");
    return doc.documentElement.textContent;
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
    mounted() {
        // this.chitabs.forEach(tab => {
        //     if (tab.$children[0].$children[0].isActive) {
        //         //tab.$children[0].$children[0].isLoaded = true;
        //         tab.$children[0].$children[0].setData();
        //     }
        // });
    },
    methods: {
        selectTab: function (selectedtab) {
            this.chitabs.forEach(tab => {
                tab.isActive = (tab.title == selectedtab.title);
                //tab.$children[0].isActive = true;
                //tab.$children[0].$children[0].$children.isActive = true;
                //prompt('', tab.$children[0].$children[0].title)
            })
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
            tabs: []
        };
    },
    created() {
        this.tabs = this.$children;
    },
    mounted() {
        //this.tabs[0].isLoaded = true;
        //alert(this.tabs.length);
        // this.tabs.forEach(tab => {
        //     if (tab.isActive) {
        //         tab.setData();

        //     }
        //     //tab.isActive = true;
        // });
        //this.tabs[0].isActive = true;

    },
    methods: {
        selectTab: function (selectedtab) {
            this.tabs.forEach(tab => {
                tab.isActive = (tab.name == selectedtab.name);
                if (!tab.isLoaded) {
                    //filename = '/temp/' + tab.name.toLowerCase() + '-parsed.json';
                    if (tab.name == selectedtab.name) {
                        //createContent(filename, tab.name.toLowerCase());
                        //tab.isLoaded = true;
                        tab.setData();
                    }
                }
                if (tab.isLoaded && tab.isActive){
                    tab.setVoice();
                }
            })
        }
    }
});

Vue.component('tab', {
    template: `
    <div :id="this.name.toLowerCase()" v-show="isActive" class='tab-details'>
        <ul>
        <li v-for="link,index in this.linklist"><a v-if="link.rurl" target="_blank" :href="link.rurl">[{{link.score}}]</a><a target="_blank" :href="link.url">{{htmlDecode(link.title)}}</a><span class="del" @click="remove(index)">✖</span></li>
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
        }

    },
    data() {
        return {
            isActive: false,
            isLoaded: false,
            linklist: []
        }
    },
    created() {
        this.isActive = this.selected;
    },
    updated() {
        if (this.linklist.length != 0)
            this.isLoaded = true;
    },
    beforeMount() {
        this.setData();
    },
    methods: {
        setData: function () {
            if (this.isActive) {
                let now = this;
                let filename = 'temp/' + this.name.toLowerCase() + '-parsed.json';
                getContent(filename, 'GET', function () {
                    now.linklist = JSON.parse(this.responseText);
                    //now.$root.$emit('voiceData',now.linklist);
                    now.$root.voice = now.linklist;
                    //prompt(now.linklist);
                });
                
                //this.linklist = now.linklist;
                //prompt(this.linklist);
                // prompt('Copy', now.name+ now.linklist.length);

            }
        },
        setVoice: function (){
            if (this.isActive) {
                //this.$root.$emit('svoiceData',this.linklist);
                this.$root.voice = this.linklist;
            }
        },
        remove: function (index) {
            this.$delete(this.linklist, index)
           }
    }
});
Vue.component('voice', {
    template:`
<div class="voice-section">
<div class="fab">
    <div class="settings" @click="settingsShown = !settingsShown">⚙️</div>
    <div class="player" @click="speaker">▶</div>
</div>
<div v-if="settingsShown" id="vsettings">
    <form>
        <input type="text" class="txt">
        <div>
          <label for="rate">Rate</label><input type="range" min="0.5" max="2" v-model="rate" step="0.1" id="rate">
          <div class="rate-value" v-text="rate">1</div>
          <div class="clearfix"></div>
        </div>
        <div>
          <label for="pitch">Pitch</label><input type="range" min="0" max="2" v-model="pitch" step="0.1" id="pitch">
          <div class="pitch-value" v-text="pitch">1</div>
          <div class="clearfix"></div>
        </div>
        <select  v-model="selectedVoice">
        <option v-for="(voice,index) in this.voices" :value="index" :data-lang="voice.lang" :data-name="voice.name">{{voice.name}}</option>
        </select>
        <div class="controls">
          <button id="play" type="submit">Play</button>
        </div>
    </form>
</div>
</div>
    `,
    data(){
        return{
            settingsShown: false,
            speak: [],
            pitch: 1,
            rate: 1,
            synth: window.speechSynthesis,
            voices: [],
            selectedVoice : 0

        }
    },
    computed(){

    },
    mounted(){ 
        this.loadVoices();
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
                this.voices = this.synth.getVoices().sort(function (a, b) {
                const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
                if ( aname < bname ) return -1;
                else if ( aname == bname ) return 0;
                else return +1;
                });
                //this.voices.forEach(e=>{console.log(e.lang,e.name)});
            });
            
        },
        speaker:function(){
            this.speak = this.$root.voice.map(x => x.title);
            if (this.synth.speaking) {
                this.synth.cancel();
                console.error('speechSynthesis.speaking');
                return;
            }
            if(this.speak !== ''){
                var utterThis = new SpeechSynthesisUtterance(this.speak.join('.'));
            }
            utterThis.onend = function (event) {
                console.log('SpeechSynthesisUtterance.onend');
            }
            utterThis.onerror = function (event) {
                console.error('SpeechSynthesisUtterance.onerror');
            }
            utterThis.voice = this.voices[this.selectedVoice];
            utterThis.pitch = this.pitch;
            utterThis.rate = this.rate;

            this.synth.speak(utterThis);

        }
    }

});

var vm = new Vue({
    el: '#app',
    data(){
        return {
            voice:[]
        }
    }
});