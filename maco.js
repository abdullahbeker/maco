(($) => {
  $.fn.maco = function (){
    const renderOptions = (original, multiple, i) => {
      var group = $('<div class="list-group"></div>'),
          selectedText = "Hiçbiri seçilmedi",
          assigned = false,
          count = 0;
      original.children().each((id, option) => {
        option = $(option);
        option.attr("id", id);
        let opt = $(`<button type="button" class="list-group-item list-group-item-action" id="${id}" data-maco-replace="${i}"></button>`);
        opt.text(option.text());
        if(option.attr("selected") && (multiple || (!multiple && !assigned))){
          count++;
          opt.addClass("active");
          if(!assigned){
            selectedText = opt.text();
            assigned = true;
          }         
        }
        if(option.attr("disabled")) opt.addClass("disabled");
        multiple
        ? opt.on("click", multipleToggleOnClick)
        : opt.on("click", toggleOnClick);
        group.append(opt);
      });

      return { group, selectedText, count };
    },
    setDisplayText = (newValue, originalId) => {
      $(`#maco-replace-display-${originalId}`).text(newValue);
    },
    renderSelf = (original, i) => {
      original = $(original);
      let
      multiple = original.attr("multiple") === "multiple" ? true : false,
      search = original.data("search"),
      searchBox = $(`
        <div class="maco-dropdown-search">
          <input type="text" class="form-control shadow-none" />
        </div>
      `),
      container = $(`<div class="${multiple ? "maco-multiple" : "maco"} dropdown"></div>`),
      { group, selectedText, count } = renderOptions(original, multiple, i),
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

      searchBox.keyup(searchOnKeyUp);

      if(search) dropdown.append(searchBox);
      dropdown.append(group);
      return {
        container,
        button,
        dropdown
      };
    },
    toggleOnClick = (e) => {
      let that = $(e.currentTarget),
          isActive = that.hasClass("active"),
          selfId = that.attr("id"),
          originalId = `#maco-${that.data("maco-replace")}`,
          original = $(originalId),
          { hasSelected, selectedId } = ((o) => {
            let opts = o.children(),
                j = 0;
            for(j; j< opts.length; j++){
              if($(opts[j]).is(":selected")) { return {hasSelected: true, selectedId: opts[j].id}}
            }
            return {hasSelected: false, selectedId: -1}
          })(original);
      
      if(hasSelected && isActive){
        original.find(`#${selfId}`).removeAttr("selected");
        that.removeClass("active");
        setDisplayText("Hiçbiri seçilmedi", that.data("maco-replace"));
      }
      else if(!hasSelected && !isActive){
        // Bunu select yap
        original.find(`#${selfId}`).attr("selected", "selected");
        that.addClass("active");
        setDisplayText(that.text(), that.data("maco-replace"));
      }
      else if(hasSelected && !isActive){
        // Secilmisi deselect yap bunu select yap
        original.find(`#${selectedId}`).removeAttr("selected");
        original.find(`#${selfId}`).attr("selected", "selected");
        that.parent().find(`#${selectedId}`).removeClass("active");
        that.addClass("active");
        setDisplayText(that.text(), that.data("maco-replace"));
      }
    },
    multipleToggleOnClick = (e) => {
      let that = $(e.currentTarget),
          isActive = that.hasClass("active"),
          selfId = that.attr("id"),
          originalId = `#maco-${that.data("maco-replace")}`,
          original = $(originalId),
          count = ((o) => {
            let opts = o.children(),
                j = 0,
                count = 0;
            for(j; j< opts.length; j++){
              if($(opts[j]).is(":selected")) count++;
            }
            return count;
          })(original);
      
      if(isActive){
        original.find(`#${selfId}`).removeAttr("selected");
        that.removeClass("active");
        count--;
        count === 0 ? setDisplayText("Hiçbiri seçilmedi", that.data("maco-replace")) : setDisplayText(`${count} adet seçildi`, that.data("maco-replace"));
      }
      else{
        original.find(`#${selfId}`).attr("selected", "selected");
        that.addClass("active");
        count++;
        setDisplayText(`${count} adet seçildi`, that.data("maco-replace"));
      }
    },
    searchOnKeyUp = (e) => {
      const
        current = $(e.currentTarget),
        value = current.find(":first-child").val().toLowerCase(),
        children = current.next().children();
      children.filter((_, el) => { return $(el).text().toLowerCase().indexOf(value) > -1 }).show();
      children.filter((_, el) => { return $(el).text().toLowerCase().indexOf(value) === -1 }).hide();
    };
    this.each((i, el) => {
      let 
        { container, button, dropdown } = renderSelf(el, i),
        now = $(el);
      now.attr("id", `maco-${i}`);
      now
        .addClass("maco-original").wrap(container).after(button).next()
        .after(dropdown);
    });

    $(document).on("click", ".maco-multiple .dropdown-menu", (e) => { e.stopPropagation(); });
    
    return this;
  };
})(jQuery);


/* $(document).on('click', '.maco-multiple .dropdown-menu', function (e) {
  e.stopPropagation();
}); */