function submitButtonClick() {
    $("#submitButton").attr("disabled", true);
    let payload = {
        "password": $("#pwd").val(),
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
            alert(resp.newId);
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
