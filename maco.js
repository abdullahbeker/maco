(($) => {
  $.fn.maco = function () {
    const renderOptions = (original, isMultiple, nth) => {
        original.prepend("<option selected disabled></option>");
        let group = $('<div class="list-group"></div>'),
          selectedText = "Hiçbiri seçilmedi",
          firstOptionTextAssigned = false,
          count = 0,
          children = original.children(),
          j = 1;
        for (j; j < children.length; j++) {
          let option = $(children[j]);
          option.attr("data-maco-original-option", nth + "-" + j);
          let opt = $(
              `<button type="button" class="list-group-item list-group-item-action" data-maco-replace-option="${j}" data-maco-replace="${nth}"></button>`
            ),
            isSelected = option.attr("selected") === "selected" ? true : false;
          opt.text(option.text());
          if (option.is(":disabled")) opt.addClass("disabled");
          if (
            isSelected &&
            (isMultiple || (!isMultiple && !firstOptionTextAssigned))
          ) {
            count++;
            opt.addClass("active");
            if (!firstOptionTextAssigned) {
              selectedText = opt.text();
              firstOptionTextAssigned = true;
            }
          }
          isMultiple
            ?
            opt.on("click", multipleToggleOnClick) :
            opt.on("click", toggleOnClick);
          group.append(opt);
        }
        return {
          group,
          selectedText,
          count,
        };
      },
      setDisplayText = (newValue, originalId) => {
        $(`#maco-replace-display-${originalId}`).text(newValue);
      },
      renderSelf = (original, i) => {
        original = $(original);
        let multiple = original.attr("multiple") === "multiple" ? true : false,
          search = original.data("search"),
          searchBox = $(`
            <div class="maco-dropdown-search">
              <input type="text" class="form-control shadow-none" />
            </div>
          `),
          container = $(
            `<div class="${
              multiple ? "maco-multiple" : "maco"
            } dropdown"></div>`
          ),
          {
            group,
            selectedText,
            count
          } = renderOptions(original, multiple, i),
          display = multiple ? `${count} adet seçildi` : selectedText,
          button = $(`
            <button type="button" data-toggle="dropdown" id="maco-replace-${i}" aria-expanded="false" class="btn-maco shadow-none form-control">
              <span id="maco-replace-display-${i}">${display}</span>
              <span class="dropdown-toggle btn-maco-caret"></span>
            </button>
          `),
          dropdown = $(`
            <div class="dropdown-menu maco-dropdown-menu" id="maco-dropdown-${i}">
            </div>
          `);

        if (search) {
          searchBox.keyup(searchOnKeyUp);
          dropdown.append(searchBox);
        }
        dropdown.append(group);
        return {
          container,
          button,
          dropdown,
        };
      },
      toggleOnClick = (e) => {
        let that = $(e.currentTarget),
          isActive = that.hasClass("active"),
          originalOptionSecond = that.data("maco-replace-option"),
          originalId = that.data("maco-replace"),
          original = $(`#maco-${originalId}`),
          {
            hasSelected,
            selectedDataValue
          } = ((o) => {
            let opts = o.children(),
              j = 1;
            for (j; j < opts.length; j++) {
              let opt = $(opts[j]);
              if (opt.attr("selected") === "selected") {
                return {
                  hasSelected: true,
                  selectedDataValue: opt.data("maco-original-option"),
                };
              }
            }
            return {
              hasSelected: false,
            };
          })(original);

        if (hasSelected && isActive) {
          original.find(`[data-maco-original-option="${originalId + "-" + originalOptionSecond}"]`).removeAttr("selected");
          that.removeClass("active");
          setDisplayText("Hiçbiri seçilmedi", that.data("maco-replace"));
        } else if (!hasSelected && !isActive) {
          original.find(`[data-maco-original-option="${originalId + "-" + originalOptionSecond}"]`).attr("selected", true);
          that.addClass("active");
          setDisplayText(that.text(), that.data("maco-replace"));
        } else if (hasSelected && !isActive) {
          original.find(`[data-maco-original-option="${selectedDataValue}"]`).removeAttr("selected");
          original.find(`[data-maco-original-option="${originalId + "-" + originalOptionSecond}"]`).attr("selected", true);
          that.parent().find(`[data-maco-replace-option="${selectedDataValue.split("-").pop()}"]`).removeClass("active");
          that.addClass("active");
          setDisplayText(that.text(), that.data("maco-replace"));
        }
      },
      multipleToggleOnClick = (e) => {
        let that = $(e.currentTarget),
          isActive = that.hasClass("active"),
          originalOptionSecond = that.data("maco-replace-option"),
          originalId = that.data("maco-replace"),
          original = $(`#maco-${originalId}`),
          count = ((o) => {
            let opts = o.children(),
              j = 1,
              count = 0;
            for (j; j < opts.length; j++) {
              if ($(opts[j]).attr("selected") === "selected") count++;
            }
            return count;
          })(original);

        if (isActive) {
          original.find(`[data-maco-original-option="${originalId + "-" + originalOptionSecond}"]`).removeAttr("selected");
          that.removeClass("active");
          count--;
          count === 0 ?
            setDisplayText("Hiçbiri seçilmedi", that.data("maco-replace")) :
            setDisplayText(`${count} adet seçildi`, that.data("maco-replace"));
        } else {
          original.find(`[data-maco-original-option="${originalId + "-" + originalOptionSecond}"]`).attr("selected", true);
          that.addClass("active");
          count++;
          setDisplayText(`${count} adet seçildi`, that.data("maco-replace"));
        }
      },
      searchOnKeyUp = (e) => {
        const current = $(e.currentTarget),
          value = current.find(":first-child").val().toLowerCase(),
          children = current.next().children();
        children
          .filter((_, el) => {
            return $(el).text().toLowerCase().indexOf(value) > -1;
          })
          .show();
        children
          .filter((_, el) => {
            return $(el).text().toLowerCase().indexOf(value) === -1;
          })
          .hide();
      };
    this.each((i, el) => {
      let {
        container,
        button,
        dropdown
      } = renderSelf(el, i),
        now = $(el);
      now.attr("id", `maco-${i}`);
      now
        .addClass("maco-original")
        .wrap(container)
        .after(button)
        .next()
        .after(dropdown);
    });

    $(document).on("click", ".maco-multiple .dropdown-menu", (e) => {
      e.stopPropagation();
    });

    return this;
  };
})(jQuery);