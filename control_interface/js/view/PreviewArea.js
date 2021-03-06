(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function() {
    return com.firsteast.PreviewArea = (function(_super) {
      __extends(PreviewArea, _super);

      function PreviewArea() {
        this.render = __bind(this.render, this);
        this.initialize = __bind(this.initialize, this);
        return PreviewArea.__super__.constructor.apply(this, arguments);
      }

      PreviewArea.prototype.className = 'preview-area';

      PreviewArea.prototype.initialize = function(options) {
        var device, selector, _i, _len, _ref;
        this.session = options.session;
        this.model = options.model;
        this.isMock = options.isMock;
        this.displayModel = this.session.displayModel;
        this.selectors = {};
        _ref = com.firsteast.OUTPUT_DEVICES;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          device = _ref[_i];
          selector = new com.firsteast.PatternSelector({
            discoModel: this.model,
            patternList: this.session.patternList,
            savedPatternList: this.session.savedPatternList,
            gifList: this.session.gifList,
            imageList: this.session.imageList,
            device: device,
            isMock: this.isMock
          });
          this.selectors[device] = selector;
        }
        if (this.isMock) {
          return this.listenTo(this.displayModel, 'change:showMock', this.render);
        } else {
          return this.listenTo(this.displayModel, 'change:showReal', this.render);
        }
      };

      PreviewArea.prototype.render = function() {
        var key, view, _ref;
        _ref = this.selectors;
        for (key in _ref) {
          view = _ref[key];
          view.render();
          this.$el.append(view.$el);
        }
        if (this.isMock && !this.displayModel.get('showMock')) {
          return this.$el.hide();
        } else if (!this.isMock && !this.displayModel.get('showReal')) {
          return this.$el.hide();
        } else {
          return this.$el.css('display', 'flex');
        }
      };

      return PreviewArea;

    })(Backbone.View);
  })();

}).call(this);
