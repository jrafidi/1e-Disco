(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function() {
    var getHexStringFromRgb, getRgbFromHexString;
    com.firsteast.PatternSelector = (function(_super) {
      __extends(PatternSelector, _super);

      function PatternSelector() {
        this._savePattern = __bind(this._savePattern, this);
        this._changeParams = __bind(this._changeParams, this);
        this._changeSavedSelected = __bind(this._changeSavedSelected, this);
        this._changeClassSelected = __bind(this._changeClassSelected, this);
        this._updateSelected = __bind(this._updateSelected, this);
        this._toggleShowEdit = __bind(this._toggleShowEdit, this);
        this._setParamValues = __bind(this._setParamValues, this);
        this._parseParams = __bind(this._parseParams, this);
        this.render = __bind(this.render, this);
        this.initialize = __bind(this.initialize, this);
        return PatternSelector.__super__.constructor.apply(this, arguments);
      }

      PatternSelector.prototype.className = 'pattern-selector';

      PatternSelector.prototype.events = {
        'change .class-patterns': '_changeClassSelected',
        'change .saved-patterns': '_changeSavedSelected',
        'change .param-input': '_changeParams',
        'click .save-button': '_savePattern',
        'click .expander': '_toggleShowEdit'
      };

      PatternSelector.prototype.initialize = function(options) {
        this.patternList = options.patternList;
        this.savedPatternList = options.savedPatternList;
        this.discoModel = options.discoModel;
        this.gifList = options.gifList;
        this.imageList = options.imageList;
        this.device = options.device;
        this.isMock = options.isMock;
        this.previewView = new com.firsteast.DevicePreview({
          device: this.device,
          model: this.discoModel
        });
        this.previewView.render();
        this.showEdit = false;
        this.parameters = {};
        this.listenTo(this.patternList, 'add remove reset', this.render);
        this.listenTo(this.savedPatternList, 'add remove reset', this.render);
        this.listenTo(this.discoModel, "change:" + this.device + "Pattern", this.render);
        this.listenTo(this.gifList, 'add remove reset', this.render);
        return this.listenTo(this.imageList, 'add remove reset', this.render);
      };

      PatternSelector.prototype.render = function() {
        var col, currentPattern, models, nonPartyWorthySaveModels, parameters, partyWorthySaveModels, saveModels, template, _ref;
        this.$el.empty();
        template = com.firsteast.templates['device-preview'];
        models = _.sortBy(this.patternList.filter(((function(_this) {
          return function(x) {
            return x.get('DEVICES').indexOf(_this.device) >= 0;
          };
        })(this))), function(x) {
          return x.get('name');
        });
        saveModels = _.sortBy(this.savedPatternList.filter((function(_this) {
          return function(x) {
            return x.get('DEVICES').indexOf(_this.device) >= 0;
          };
        })(this)), function(x) {
          return x.get('saveName');
        });
        col = new Backbone.Collection(saveModels);
        partyWorthySaveModels = col.where({
          partyWorthy: true
        });
        nonPartyWorthySaveModels = col.where({
          partyWorthy: false
        });
        currentPattern = (_ref = this.discoModel.get("" + this.device + "Pattern")) != null ? _ref.attributes : void 0;
        parameters = this._parseParams(_.defaults({}, currentPattern != null ? currentPattern.params : void 0, currentPattern != null ? currentPattern.DEFAULT_PARAMS : void 0));
        this.$el.append(template({
          device: this.device,
          patterns: models,
          savedPatterns: saveModels,
          partyWorthySavedPatterns: partyWorthySaveModels,
          nonPartyWorthySavedPatterns: nonPartyWorthySaveModels,
          currentPattern: currentPattern,
          gifList: this.gifList.models,
          imageList: this.imageList.models,
          parameters: parameters,
          showEdit: this.showEdit,
          isMock: this.isMock
        }));
        this.$('.preview-view').append(this.previewView.$el);
        this._updateSelected();
        return this._setParamValues(parameters);
      };

      PatternSelector.prototype._parseParams = function(params) {
        var key, param, result, val;
        result = [];
        for (key in params) {
          val = params[key];
          param = {
            name: key
          };
          param.val = val;
          if (typeof val === "object") {
            if (val.RGBValues != null) {
              param.type = 'color';
              param.val = getHexStringFromRgb(param.val.RGBValues);
            }
          } else if (typeof val === "boolean") {
            param.type = 'checkbox';
          } else if (typeof val === "string") {
            if (val.indexOf('.json') >= 0) {
              param.pattern = true;
              param.val = param.val.split('.json')[0];
            } else if (val.indexOf('.gif') >= 0) {
              param.gif = true;
            } else if (val.indexOf('.jpg') >= 0 || val.indexOf('.png') >= 0) {
              param.image = true;
            } else {
              param.type = 'text';
            }
          } else if (typeof val === 'number' || !isNaN(val)) {
            param.type = 'number';
          } else {
            param.type = 'text';
          }
          result.push(param);
        }
        return _.sortBy(result, function(x) {
          return x.name;
        });
      };

      PatternSelector.prototype._setParamValues = function(params) {
        var param, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = params.length; _i < _len; _i++) {
          param = params[_i];
          _results.push(this.$("[name='" + param.name + "']").val(param.val));
        }
        return _results;
      };

      PatternSelector.prototype._toggleShowEdit = function() {
        this.showEdit = !this.showEdit;
        return this.render();
      };

      PatternSelector.prototype._updateSelected = function() {
        var _ref, _ref1, _ref2, _ref3;
        if ((_ref = this.discoModel.get("" + this.device + "Pattern")) != null ? _ref.get('saved') : void 0) {
          this.$('.saved-patterns').val((_ref1 = this.discoModel.get("" + this.device + "Pattern")) != null ? _ref1.get('saveName') : void 0);
          return this.$('.class-patterns').val((_ref2 = this.discoModel.get("" + this.device + "Pattern")) != null ? _ref2.get('name') : void 0);
        } else {
          this.$('.saved-patterns').val(null);
          return this.$('.class-patterns').val((_ref3 = this.discoModel.get("" + this.device + "Pattern")) != null ? _ref3.get('name') : void 0);
        }
      };

      PatternSelector.prototype._changeClassSelected = function() {
        var name, pattern;
        name = this.$('.class-patterns').val();
        pattern = this.patternList.where({
          name: name
        })[0].attributes;
        pattern = $.extend(true, {}, pattern);
        return this.discoModel.set("" + this.device + "Pattern", new com.firsteast.PatternModel(pattern));
      };

      PatternSelector.prototype._changeSavedSelected = function() {
        var name, pattern;
        name = this.$('.saved-patterns').val();
        pattern = this.savedPatternList.where({
          saveName: name
        })[0].attributes;
        pattern = $.extend(true, {}, pattern);
        return this.discoModel.set("" + this.device + "Pattern", new com.firsteast.PatternModel(pattern));
      };

      PatternSelector.prototype._changeParams = function(event) {
        var inp, name, params, type, val;
        params = this.discoModel.get("" + this.device + "Pattern").get('params');
        inp = $(event.currentTarget);
        val = inp.val();
        name = inp.prop('name');
        type = inp.prop('type');
        if (val.length === 0) {
          return;
        }
        if (type === 'text' && val.indexOf('#') === 0) {
          if (val.match(/^#([0-9a-f]{6})$/i)) {
            type = 'color';
          } else {
            return;
          }
        }
        if (type === 'color') {
          params[name] = {
            RGBValues: getRgbFromHexString(val)
          };
        } else if (type === 'checkbox') {
          params[name] = inp.prop('checked');
        } else if (inp.data('type') === 'pattern') {
          params[name] = val + '.json';
        } else if (type === 'number') {
          params[name] = parseFloat(val);
        } else {
          params[name] = val;
        }
        return this.discoModel.trigger("" + this.device + "ChangeParam", {
          name: name,
          val: params[name]
        });
      };

      PatternSelector.prototype._savePattern = function() {
        var existingPattern, pattern, patternModel, saveName;
        saveName = this.$('.save-name-input').val();
        pattern = this.discoModel.get("" + this.device + "Pattern").attributes;
        pattern = $.extend(true, {}, pattern);
        pattern.saved = true;
        pattern.saveName = saveName;
        pattern.partyWorthy = this.$('.party-worthy-input').prop('checked');
        patternModel = new com.firsteast.PatternModel(pattern);
        existingPattern = this.savedPatternList.where({
          saveName: saveName
        });
        if (existingPattern.length > 0) {
          this.savedPatternList.remove(existingPattern[0]);
        }
        return this.savedPatternList.add(patternModel);
      };

      return PatternSelector;

    })(Backbone.View);
    getRgbFromHexString = (function(_this) {
      return function(hex) {
        var blue, green, red;
        red = parseInt(hex.substring(1, 3), 16);
        green = parseInt(hex.substring(3, 5), 16);
        blue = parseInt(hex.substring(5, 7), 16);
        return [red, green, blue];
      };
    })(this);
    return getHexStringFromRgb = (function(_this) {
      return function(RGB) {
        var hex, total, val, _i, _len;
        total = "#";
        for (_i = 0, _len = RGB.length; _i < _len; _i++) {
          val = RGB[_i];
          hex = val.toString(16);
          if (hex.length === 1) {
            hex = '0' + hex;
          }
          total = total + hex;
        }
        return total;
      };
    })(this);
  })();

}).call(this);
