
// still need this for Safari.  All the other browsers work fine using flexbox only.
function set_credit_at_bottom()
{
    return;
    console.log("window.height = " + $(window).height());
    console.log("#credits.position().top = " + $("#credits").position().top);
    console.log("#credits.height() = " + $("#credits").height());
    console.log("#credits.css('margin-top') = " + $("#credits").css("margin-top"));
    $("#credits").css("margin-top", $(window).height() - $("#credits").position().top - $("#credits").height());
}

function set_codeblock_widths()
{
    return;
    if( $("pre").length != 0 )
    {
        var paddingRight = $("pre").css("padding-right");
        var paddingLeft = $("pre").css("padding-left");
        paddingLeft = paddingLeft.substring(0,paddingLeft.length-2);
        paddingRight = paddingRight.substring(0,paddingRight.length-2);
        paddingLeft = parseInt(paddingLeft);
        paddingRight = parseInt(paddingRight);

        // padding is left in innerWidth
        $("pre").width($("article").innerWidth() - paddingRight - paddingLeft);
    }
}

function loadContent(href)
{
    $("#post").load(href + " #content", function() {

        set_codeblock_widths();

        // rebind the click event for the anchors in the new doc
        $("#post a").click( onClick );
    });

    set_credit_at_bottom();
}

function onClick(e)
{
    var _href = $(this).attr("href");

    // if this not a post for the blog, then load the new page
    if( $(this).context.host != window.location.host || _href.startsWith("/pages") || _href.startsWith("/download")) {
        console.log("$(this).context.host = " + $(this).context.host);
        console.log("window.location = " + window.location);
        window.location = _href;
        return;
    }

    e.preventDefault();
    console.log("pushState " + _href);
    history.pushState(null, null, _href);
    loadContent(_href);
}

$(document).ready( function() {

    var popped = ('state' in window.history && window.history.state !== null), initialURL = location.href;

    if( !!(window.history && window.history.pushState) )
    {
        $("#body a").click( onClick );

        console.log("Binding popstate");
        $(window).bind("popstate", function(e) {

            console.log("popstate " + location.href);
            var initialPop = !popped && location.href == initialURL;
            popped = true;
            if ( initialPop )
            {
                return;
            }
            e.preventDefault();
            loadContent(location.href);
        });

        set_codeblock_widths();
    }
    else
    {
        // do nothing, and everything behaves as if there was no javascript
    }

    set_credit_at_bottom();

    $(window).resize(function() {
        set_credit_at_bottom();
        set_codeblock_widths();
    });
});
