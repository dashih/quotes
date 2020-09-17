function submitButtonClick() {
    $("#submitButton").attr("disabled", true);
    let payload = {
        "speaker": $("#speaker").val(),
        "quote": $("#quote").val()
    }

    $.ajax({
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        url: "/submit",
        data: JSON.stringify(payload),
        success: resp => {
            alert("Added quote resp.newId and set as MOTD!");
            $("#submitButton").attr("disabled", false);
        },
        error: (xhr, ajaxOptions, thrownError) => {
            alert(thrownError);
            $("#submitButton").attr("disabled", false);
        }
    });
}

$(document).ready(() => {
    $("#submitButton").click(submitButtonClick);
});
