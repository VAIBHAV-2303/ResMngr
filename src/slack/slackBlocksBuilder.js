/*
Class with methods to help
generate blocks used in 
response to release, remove, etc. 
*/

module.exports = class slackBlocksBuilder {
    
    getHelloBlock(greeting, cmds) {
        
        var blocks = [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": greeting
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": cmds
                }
            }
        ];
        return blocks;
    }    

    getListWithLockStatusBlock(listOfResources) {
        
        var blocks = [];
        for (var resourceName in listOfResources) {
            var temp;
            if (listOfResources[resourceName]["locked"]) {
                temp = {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*${resourceName}*, Locked by: <@${listOfResources[resourceName]["user_id"]}> :x:`
                    }
                };
            }
            else {
                temp = {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*${resourceName}*, Available:heavy_check_mark:`
                    }
                };
            }
            blocks.push(temp);
        }
        return blocks;
    }

    getListWithReleaseBlock(listOfResources, userId) {
        
        var blocks = [];
        
        // Heading block
        blocks.push({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Select which resource you'd like to release*"
            }
        }, 
        {
            "type": "divider"
        });
        
        // Remaining blocks
        for (var resourceName in listOfResources) {
            if (listOfResources[resourceName]["locked"] && listOfResources[resourceName]["user_id"]==userId){
                blocks.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*${resourceName}*`
                    },
                    "accessory": {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "emoji": true,
                            "text": "Release"
                        },
                        "style": "danger",
                        "value": "release",
                        "action_id": `release/${resourceName}`
                    }
                });
            }
        }
        return blocks;
    }

    getListWithRemoveBlock(listOfResources) {
        
        var blocks = [];
        
        // Heading blocks
        blocks.push({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Select which resource you'd like to remove*"
            }
        }, 
        {
            "type": "divider"
        });
        
        // Remaining blocks
        for (var resourceName in listOfResources) {
            var temp;
            if (listOfResources[resourceName]["locked"]) {
                temp = {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*${resourceName}*\nLocked by: @${listOfResources[resourceName]["user_name"]}`
                    }
                };
            }
            else {
                temp = {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*${resourceName}*\nAvailable`
                    },
                    "accessory": {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "emoji": true,
                            "text": "Remove"
                        },
                        "style": "danger",
                        "value": "remove",
                        "action_id": `remove/${resourceName}`
                    }
                };
            }
            blocks.push(temp);
        }
        return blocks;
    }

    getEnvDropdownBlock(listOfResources) {
        
        // Getting unique envs
        var S = new Set();    
        for(var resourceName in listOfResources){
            S.add(resourceName.split('_')[0]);
        }
        
        // Creating options array
        var envOptions = [];
        for(const v of S.values()) {
            envOptions.push({
                "text": {
                    "type": "plain_text",
                    "text": `${v}`
                },
                "value": `${v}`
            });
        }
        
        var envDropdown = {
            "type": "static_select",
            "placeholder": {
                "type": "plain_text",
                "text": "Select Environment"
            },
            "action_id": `envLock`,
            "options": envOptions,
            "initial_option": envOptions[0]
        }

        var block = {
            "type": "section",
            "text": {
                "type": "plain_text",
                "text": "Select Environment"
            },
            "accessory": envDropdown
        };
        var selected_env = envOptions[0]["value"];

        return [block, selected_env];
    }

    getResNameDropdownBlock(listOfResources, selected_env) {
        
        var resNameOptions = [];
        for(var resourceName in listOfResources){
            if(resourceName.split('_')[0]==selected_env){
                resNameOptions.push({
                    "text": {
                        "type": "plain_text",
                        "text": `${resourceName.split("_")[1]}`
                    },
                    "value": `${resourceName}`
                });
            }
        }
        var resNameDropdown = {
            "type": "static_select",
            "placeholder": {
                "type": "plain_text",
                "text": "Select Resource"
            },
            "action_id": `resNameLock`,
            "options": resNameOptions,
            "initial_option": resNameOptions[0]
        }

        var block = {
            "type": "input",
            "element": resNameDropdown,
            "label": {
                "type": "plain_text",
                "text": "Select Resource"
            }
        };
        return block;
    }

    getTimeDropdownBlock(low, high, deflt) {
        
        var timeOptions = [];
        for(var i=low; i<=high;i++ ){
            timeOptions.push({
                "text": {
                    "type": "plain_text",
                    "text": `${i}`
                },
                "value": `${i}`
            });
        }
        
        var timeDropdown = {
            "type": "static_select",
            "placeholder": {
                "type": "plain_text",
                "text": "Select hours"
            },
            "action_id": `timeLock`,
            "options": timeOptions,
            "initial_option": timeOptions[deflt-1]
        }

        var block = {
            "type": "input",
            "element": timeDropdown,
            "label": {
                "type": "plain_text",
                "text": "Select Hours(duration)"
            }
        };
        return block;
    }

    getViewWithSubmit(blocks, id, title) {
        
        var view = {
            "type": "modal",
            "title": {
                "type": "plain_text",
                "text": title
            },
            "submit": {
                "type": "plain_text",
                "text": "Submit"
            },
            "external_id": id,
            "private_metadata": id,
            "blocks": blocks
        };
        return view;
    }

}