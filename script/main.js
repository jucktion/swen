function getContent(t,e="GET",s){let i=new XMLHttpRequest;i.open(e,t,!0),i.send(),i.onreadystatechange=function(){4===i.readyState&&200===i.status&&(i.responseText,"function"==typeof s&&s.apply(i))}}let url=new URL(document.URL),rd=url.searchParams.get("r")?"https://"+url.searchParams.get("r"):"https://reddit.com",lang=null===url.searchParams.get("l")?navigator.language:""==url.searchParams.get("l")?navigator.language:url.searchParams.get("l").length>0?url.searchParams.get("l"):"",speaker=url.searchParams.get("s")||"",hash=""!=window.location.hash?window.location.hash.split("#")[1].split(","):"",h1=hash.length>=1?hash[0].toLowerCase():"",h2=hash.length>=2?hash[1].toLowerCase():"";Vue.component("tablet",{template:`
    <div>
        <div class="tabs is-centered is-toggle navbar is-toggle-rounded">
            <ul>
                <li v-for="tab in parents" :class="{'is-active': tab.isActive}"><a @click="selectTab(tab)" :href="'#'+tab.title.toLowerCase()">{{tab.title}}</a></li>
            </ul>
        </diV>
        <div class='tab-details'>
            <slot></slot>
        </div>

    </div>
    `,data:()=>({parents:[]}),created(){this.parents=this.$children},mounted(){this.hashActivate()},methods:{selectTab:function(t){this.parents.forEach(e=>{e.isActive=e.title==t.title,e.title==t.title&&e.setChildActive()})},hashActivate:function(){""!=h1?this.parents.forEach(t=>{t.title.toLowerCase()==h1&&(t.isActive=t.selected=!0,""==h2&&t.setChildActive())}):""==h1&&""==h2&&(this.parents[0].isActive=this.parents[0].selected=!0,this.parents[0].setChildActive())}}}),Vue.component("parent",{template:`
    <div v-show="isActive" class='tab-details'>
        <slot></slot>
    </div>
    `,props:{title:{required:!0},selected:{default:!1}},data:()=>({isActive:!1}),mounted(){this.isActive=this.selected},methods:{setChildActive:function(){this.$children[0].selectDef()}}}),Vue.component("tabs",{template:`
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
    `,data:()=>({tabs:[],isActive:!1}),created(){this.tabs=this.$children},mounted(){h2.length>1&&this.hashActivate(),this.filterTab(this.tabs)},methods:{selectTab:function(t){this.tabs.forEach(e=>{e.isActive=e.current=e.name==t.name,e.name==t.name&&(e.isLoaded||e.setData(),e.current=!0,e.isLoaded&&e.isActive&&e.current&&e.setVoice())})},filterTab:function(t){return this.tags=this.tabs,this.tags.forEach((t,e)=>{t.tag=0==e?"":","+t.name}),this.tags},hashActivate:function(){""!=h2?this.tabs.forEach(t=>{tabname=t.name,t.isActive=t.current=tabname==h2,tabname==h2&&tabname==h2&&(t.isLoaded||t.setData(),t.current=!0,t.isLoaded&&t.isActive&&t.current&&t.setVoice())}):this.tabs[0].isActive=this.tabs[0].selected=!0},selectDef:function(){this.selectTab(this.$children[0])}}}),Vue.component("tab",{template:`
    <div :id="this.name.toLowerCase()" v-show="isActive" class='tab-details'>
        <ul>
        <li v-for="link,index in this.linklist">
        <span class="itm">{{index+1}}</span>
        <a v-if="link.r" rel="noopener, noreferrer" target="_blank" :href="rd + link.r">[{{link.s}}]</a>
        <a v-if="link.c" rel="noopener, noreferrer" target="_blank" :href="link.c">[{{link.s}}]</a>
        <a  rel="noopener, noreferrer" target="_blank" :href="link.u">{{htmlDecode(link.t)}}</a><span class="del" @click="remove(index)">x</span></li>
        </ul>
        <slot></slot>
    </div>
    `,props:{name:{required:!0},selected:{default:!1},title:{required:!0},voice:{default:!1}},data(){return{isActive:!1,isLoaded:!1,current:this.voice,linklist:[]}},created(){this.isActive=this.selected},updated(){this.$parent.isActive&&this.isActive&&!this.isLoaded&&(this.current=!0,this.setData(),this.setVoice()),0!=this.linklist.length&&(this.isLoaded=!0),this.current&&this.setVoice()},beforeMount(){this.isLoaded||this.setData()},methods:{setData:function(){if(this.isActive){let t=this;getContent("temp/"+this.name.toLowerCase()+"-parsed.json","GET",function(){t.linklist=JSON.parse(this.responseText)})}},setVoice:function(){this.current&&this.isActive&&(this.$root.voice=this.linklist)},remove:function(t){this.$delete(this.linklist,t)},htmlDecode:function(t){let e=new DOMParser().parseFromString(t,"text/html");return e.documentElement.textContent}}}),Vue.component("voice",{template:`
<div v-show="showFab" class="voice-section">
<div class="fab">
    <div class="settings" @click="settingsShown = !settingsShown"><img src="/img/settings.svg" alt="Voice settings"></div>

    <div class="player"><span @click="stopSpeak" v-show="stopShown" class="stop"><img src="/img/stop.svg" alt="Stop Player"></span><span @click="speaker" class="play"><img :src="svg"></span></div>
</div>
<div v-if="settingsShown" id="vsettings">
<span @click="settingsShown = !settingsShown" class="close">x</span>
    <form>
        <select name="voice" v-model="selectedVoice">
        <option v-for="(voice,index) in this.voices" :value="index" :data-lang="voice.lang" :data-name="voice.name">{{voice.name}}</option>
        </select>
        <div>
          <label for="rate">Rate</label><input id="rate" type="range" min="0.5" max="2" v-model="rate" step="0.1" id="rate">
          <span v-text="rate">1</span>
        </div>
        <div>
          <label for="pitch">Pitch</label><input id="pitch" type="range" min="0" max="2" v-model="pitch" step="0.1" id="pitch">
          <span v-text="pitch">1</span>
        </div>
        <div>
        <label for="separator">Separator</label><input id="separator" v-model="separator" :value='separator'></input>
        </div>
        <div>
        <label for="startItem">Start: </label><span v-text="startItem">1</span><input id="startItem" v-model.number="startItem" type="range" min="1" :max="endItem" :value='startItem' size="2"></input>
        <label for="endItem">End: </label><span v-text="endItem ">1</span><input id="endItem" v-model.number="endItem" type="range" :min="startItem" max="25" :value='endItem' size="1"></input>
        </div>
    </form>
</div>
</div>
    `,data:()=>({settingsShown:!1,stopShown:!1,showFab:!1,svg:"/img/play.svg",speak:[],saythis:null,pitch:1,rate:1,separator:".... and in other news ....",synth:window.speechSynthesis,voices:[],selectedVoice:0,startItem:1,endItem:25}),mounted(){this.showFab="speechSynthesis"in window,this.showFab&&(this.loadVoices(),this.synth.cancel());window.matchMedia("(max-width: 512px)").matches||window.addEventListener("scroll",this.onScroll)},beforeDestroy(){window.removeEventListener("scroll",this.onScroll)},methods:{loadVoices:function(){new Promise(function(t,e){let s;s=setInterval(()=>{0!==window.speechSynthesis.getVoices().length&&(t(window.speechSynthesis.getVoices()),clearInterval(s))},10)}).then(t=>{this.voices=speaker&&lang?t.filter(function(t){return -1!=t.name.toLowerCase().indexOf(speaker.toLowerCase())}):lang?t.filter(function(t){return -1!=t.lang.indexOf(lang)}):t})},speaker:function(){if(null!=this.saythis||this.synth.speaking||(this.speak=this.$root.voice.map(t=>t.t),this.saythis=this.speak.slice(this.startItem-1,this.endItem).join(this.separator)),this.synth.speaking&&!this.synth.paused){this.synth.pause(),this.playPause(0);return}if(this.synth.paused&&this.synth.speaking){this.synth.resume(),this.playPause(1);return}if(!this.synth.paused&&null!=this.saythis){let t=new SpeechSynthesisUtterance(this.saythis);this.stopShown=!0,now=this,t.onend=function(t){now.stopSpeak()},t.onerror=function(t){console.error("SpeechSynthesisUtterance.onerror")},t.voice=this.voices[this.selectedVoice],t.pitch=this.pitch,t.rate=this.rate,this.synth.speak(t),this.playPause(1)}},stopSpeak:function(){this.synth.cancel(),this.stopShown=!1,this.saythis=null,this.playPause(0)},playPause:function(t){this.svg=0==t?"/img/play.svg":"/img/pause.svg"},onScroll:function(){this.showFab=window.innerHeight+window.scrollY!=document.body.offsetHeight}}});let vm=new Vue({el:"#app",data:()=>({voice:[]})});