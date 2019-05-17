module.exports = {

    stdin: () => {
        let last = null;
        process.openStdin().addListener("data", async function (d) {
            if (d.toString().trim().length !== 0) last = d.toString().trim();
            switch (last) {
                //
            }
        });
    }

};