function getContent(url, methodType = 'GET', callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(methodType, url, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log("xhr done successfully");
                var resp = xhr.responseText;
                // var respJson = JSON.parse(resp);
                // //console.log(respJson);
                // return respJson;
                if (typeof callback === "function") {
                    // apply() sets the meaning of "this" in the callback
                    callback.apply(xhr);
                }
            } else {
                console.log("xhr failed");
            }
        } else {
            console.log("xhr processing going on");
        }
    }
    console.log("request sent succesfully");
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
            })
        }
    }
});

Vue.component('tab', {
    template: `
    <div :id="this.name.toLowerCase()" v-show="isActive" class='tab-details'>
        <ul>
        <li v-for="link in this.linklist"><a v-if="link.rurl" target="_blank" :href="link.rurl">[{{link.score}}]</a><a target="_blank" :href="link.url">{{htmlDecode(link.title)}}</a></li>
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
        setData() {
            if (this.isActive) {
                let now = this;
                let filename = 'temp/' + this.name.toLowerCase() + '-parsed.json';
                getContent(filename, 'GET', function () {
                    now.linklist = JSON.parse(this.responseText);
                    //prompt(now.linklist);
                });
                //this.linklist = now.linklist;
                //prompt(this.linklist);
                // prompt('Copy', now.name+ now.linklist.length);

            }
        }
    }
});

var vm = new Vue({
    el: '#app',
});