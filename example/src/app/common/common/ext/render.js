const render = (function () {

    let render = {};

    render.getContainer = function (id = '') {

        let DOM = render.create('<div id="'+ id +'"></div>');

        return {
            el: DOM,
            // 支持格式： 
            // append("")  append(dom) append(Component) append([dom1, dom2, Component])
            // append(Component, dom)
            // 这种不行：
            // append("", [dom]) append([Template], "")
            append: function (template) {
                let templates = Array.prototype.slice.call(arguments);

                // 如果第一个参数传了数组，后面的参数无效
                if (util.type(template) == "array") {
                    templates = template;
                }

                templates.map(template => {
                    let type = util.type(template);
                    if (util.isEmpty(template)) {
                        return false;
                    }
                    if (type == "string") {
                        template = template.trim();
                        if (template.length == 0) {
                            return false;
                        }
                        template = render.create(template);
                        type = "dom";
                    }
                    if (type == "dom") {
                        return template;
                    }
                    if (util.type(template.el) == "dom") {
                        return template.el;
                    }
                    return false;
                }).filter(dom => {
                    return dom !== false;
                }).map(dom => {
                    DOM.appendChild(dom);
                });

                return this;
            },
            render: function (selector) {
                if (typeof selector == 'undefined') {
                    let original = document.querySelector('#' + id);
                    original.parentNode.replaceChild(DOM, original);
                } else {
                    let parent = document.querySelector(selector);
                    parent.append(DOM);
                }
                setTimeout(() => {
                    DOM.className = (DOM.className + " on").trim();
                }, 100);
            }
        };
    };

    /**
     * 通过字符串模板创建DOM
     * @param {String} string 字符串模板，模板必须包含一个最外层标签
     */
    render.create = function (string) {
        let Element = document.createElement('div');
        string = string.trim();

        const wrapMap = {
            thead: [ 1, "<table>", "</table>" ],
            tbody: [ 1, "<table>", "</table>" ],
            col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
            tr: [ 2, "<table><tbody>", "</tbody></table>" ],
            td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
            th: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
            _default: [ 0, "", "" ]
        };
        let tag = ( ( /<([a-z][^\/\0>\x20\t\r\n\f]*)/i ).exec( string ) || [ "", "" ] )[ 1 ].toLowerCase();
        let wrap = wrapMap[ tag ] || wrapMap._default;
        Element.innerHTML = wrap[ 1 ] + string + wrap[ 2 ];
        let j = wrap[ 0 ];
        while ( j-- ) {
            Element = Element.lastChild;
        }

        return Element.firstChild;
    };

    render.compile = function (DOM, template, event = function () {}) {
        let Element = this.create(template);
        event && event(Element);
        if (typeof DOM == 'string') {
            DOM = document.querySelector(DOM);
        }
        DOM.appendChild(Element);
    };

    return render;
})();