Vue.config.devtools=true;function getContent(url,methodType='GET',callback){let xhr=new XMLHttpRequest();xhr.open(methodType,url,true);xhr.send();xhr.onreadystatechange=function(){if(xhr.readyState===4){if(xhr.status===200){let resp=xhr.responseText;if(typeof callback==="function"){callback.apply(xhr);}}else{}}else{}}}
Vue.component('partabs',{template:`
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
    `,data(){return{chitabs:[]};},created(){this.chitabs=this.$children;},methods:{selectTab:function(selectedtab){this.chitabs.forEach(tab=>{tab.isActive=(tab.title==selectedtab.title);if(tab.title==selectedtab.title)
tab.setChildActive();});}}});Vue.component('chitab',{template:`
    <div v-show="isActive" class='tab-details'>
        <slot></slot>
    </div>
    `,props:{title:{required:true},selected:{default:false}},data(){return{isActive:false,}},mounted(){this.isActive=this.selected;},methods:{setChildActive:function(){this.$children[0].selectDef();}}});Vue.component('tabs',{template:`
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
    `,data(){return{tabs:[],isActive:false};},created(){this.tabs=this.$children;},methods:{selectTab:function(selectedtab){this.tabs.forEach(tab=>{tab.isActive=(tab.name==selectedtab.name);if(!tab.isLoaded){if(tab.name==selectedtab.name){tab.setData();}}
if(tab.name==selectedtab.name){tab.current=true;if(tab.isLoaded&&tab.isActive&&tab.current){tab.setVoice();}}});},selectDef:function(){this.selectTab(this.$children[0]);}}});Vue.component('tab',{template:`
    <div :id="this.name.toLowerCase()" v-show="isActive" class='tab-details'>
        <ul>
        <li v-for="link,index in this.linklist"><span class="itm">{{index+1}}</span><a v-if="link.rurl" target="_blank" :href="link.rurl">[{{link.score}}]</a><a target="_blank" :href="link.url">{{htmlDecode(link.title)}}</a><span class="del" @click="remove(index)">x</span></li>
        </ul>
        <slot></slot>
    </div>
    `,props:{name:{required:true},selected:{default:false},title:{required:true},voice:{default:false}},data(){return{isActive:false,isLoaded:false,current:this.voice,linklist:[]}},created(){this.isActive=this.selected;},updated(){if(this.$parent.isActive&&this.isActive&&!this.isLoaded){this.current=true;this.setData();this.setVoice();}
if(this.linklist.length!=0)
this.isLoaded=true;if(this.current)
this.setVoice();},beforeMount(){if(!this.isLoaded)
this.setData();},methods:{setData:function(){if(this.isActive){let now=this;let filename='temp/'+this.name.toLowerCase()+'-parsed.json';getContent(filename,'GET',function(){now.linklist=JSON.parse(this.responseText);});}},setVoice:function(){if(this.current&&this.isActive){this.$root.voice=this.linklist;}},remove:function(index){this.$delete(this.linklist,index)},htmlDecode:function(str){const doc=new DOMParser().parseFromString(str,"text/html");return doc.documentElement.textContent;}}});Vue.component('voice',{template:`
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
        <label for="startItem">Start</label><input v-model.number="startItem" type="number" min="1" max="99" :value='startItem' size="2"></input>
        <label for="endItem">End</label><input v-model.number="endItem" type="number" min="2" max="100" :value='endItem' size="2"></input>
        </div>
    </form>
</div>
</div>
    `,data(){return{settingsShown:false,stopShown:false,showFab:true,svg:'/img/play.svg',speak:[],pitch:1,rate:1,separator:'.... and in other news ....',synth:window.speechSynthesis,voices:[],selectedVoice:0,startItem:1,endItem:25}},mounted(){if('speechSynthesis'in window){this.loadVoices();this.synth.cancel();window.addEventListener('scroll',this.onScroll);}else{this.showFab=false;}},beforeDestroy(){window.removeEventListener('scroll',this.onScroll)},methods:{loadVoices:function(){function setSpeech(){return new Promise(function(resolve,reject){let synth=window.speechSynthesis;let id;id=setInterval(()=>{if(synth.getVoices().length!==0){resolve(synth.getVoices());clearInterval(id);}},10);})}
let s=setSpeech();s.then((voices)=>{this.voices=this.synth.getVoices();});},speaker:function(){this.speak=this.$root.voice.map(x=>x.title);if(this.synth.speaking&&!this.synth.paused){this.synth.pause();this.playPause(0);return;}
if(this.synth.paused&&this.synth.speaking){this.synth.resume();this.playPause(1);return;}
if(this.speak.length>0){let utterThis=new SpeechSynthesisUtterance(this.speak.slice(this.startItem-1,this.endItem).join(this.separator));this.stopShown=true;now=this;utterThis.onend=function(event){now.stopSpeak();}
utterThis.onerror=function(event){console.error('SpeechSynthesisUtterance.onerror');}
utterThis.voice=this.voices[this.selectedVoice];utterThis.pitch=this.pitch;utterThis.rate=this.rate;this.synth.speak(utterThis);this.playPause(1);}},stopSpeak:function(){this.synth.cancel();this.stopShown=false;this.playPause(0);},playPause:function(state){this.svg=state==0?'/img/play.svg':'/img/pause.svg';},onScroll:function(){this.showFab=(window.innerHeight+window.scrollY)!=document.body.offsetHeight;}}});let vm=new Vue({el:'#app',data(){return{voice:[]}}});