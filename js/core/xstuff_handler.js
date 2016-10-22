var Engine = angular.module('XStuff',  []);
var Handlers = function()
{
	var Events = {}; //denota eventos vinculados a botões e afins
	var HTML = {}; //denota templates de html que são inseridos na página conforme necessário	
	var Load = {}; //denota funções que carrregam templates e funcionalidades conforme necessário na página
	var Modules = {}; //representa funções conforme as funcionalidades exsitente
	var Prototypes = {}; // denota estruturas de objetos previamente definifos
	var Start; // usado pra inicializar os Tasks_Asks
	var Tasks = []; //aramazena os dados preenchidos pelos usuários :)
	var Tasks_Asks = []; // armazena as informações que são perguntadas ao usuário
	var Tasks_Count = 0;
	var Unload = {};     // faz a destruição de elementos carregados

	var opt = { //Aramazena o estado, ou seja, qual funcionalidade do sistema está sendo utilizada no momento.
		name: "Home",
		elem: null
	}
	var selected = {} // É a tarefa que está selecionada, ou para edição ou para exclusão

	HTML.Templates = {}; //armazena contéudos que serão utilizados

	// Apartir do Controlador do angular, apenas é possível acessar o que for público
	this.Load = Load; // torna público todas as funções de Load :)
	this.opt = opt; // torna público a ultima opção selecionada :)
	this.Unload = Unload;


	/* ---------------------------------------------------------- Eventos de objetos do sistema e afins ------------------------------------------ */

	Events.Home = function()
	{
		$(window).resize(function()
		{
			Events.Resize($('.v-container'));			
		})
	}
	Events.MenuBar = function()
	{
		$('.v-left-bar-item').on('mouseover', function(ev)
		{
			var elem = $(this);
			elem.tooltip('show');

			elem.css({
				'background': 'rgb(180, 45, 60)',
				color: 'rgb(255,255,255)'
			});

			ev.preventDefault();
		})
		$('.v-left-bar-item').on('mouseleave', function(ev)
		{
			var elem = $(this);
			elem.tooltip('hide');
			if(elem.attr('data-click').search(opt.name) == -1)
			{
				elem.css({
					'background': 'rgb(255, 255, 255)',
					color: 'rgb(180, 45, 60)'
				});
			}

			ev.preventDefault();
		})
		$('.v-left-bar-item').on('click', function(ev)
		{
			var elem = $(this);

			if(opt.elem == null || opt.elem[0] != elem[0])
			{
				if(opt.elem != null)	
				{	
					opt.elem.css({
						'background': 'rgb(255, 255, 255)',
						color: 'rgb(180, 45, 60)'
					});
				}

				opt.name = elem.attr('data-click');
				opt.elem = elem;
			}
			if(opt.name == "new_tasks")
				Modules.NewTasks();
		})
	}
	Events.Modal = function(type)
	{
		$('.v-modal-btn-cancel').unbind('click').on('click', function(ev)
		{
			Unload.Modal(true);
			ev.preventDefault();
		})
		$('.v-modal-btn').unbind('mouseover').on('mouseover', function()
		{
			$(this).tooltip('show');
		})
		$('.v-modal-btn').unbind('mouseleave').on('mouseleave', function()
		{
			$(this).tooltip('hide');
		})

		if(type == "remove_task")
		{
			$('.v-modal-btn-warning').unbind('click').on('click', function(ev)
			{
				for(var i = 0; i < Tasks.length; i++)
				{
					if(selected.task.id == Tasks[i].id)
					{
						Tasks.splice(i, 1);
						selected.elem.remove();
						break;
					}
				}

				if(Tasks.length == 0)
					Load.Tasks();

				Unload.Modal(true);
				ev.preventDefault();
			})
		}
		else if( type == "new_task")
		{
			$('.v-modal-btn-ready').unbind('click').on('click', function(ev)
			{
				var task = Modules.GetTaskData()	
				if(task)
					Modules.TaskManager(task);			

				ev.preventDefault();
			})
		}
		else if( type == "edit_task")
		{
			$('.v-modal-btn-ready').unbind('click').on('click', function(ev)
			{
				var task = Modules.GetTaskData(true)	
				if(task)
					Modules.TaskManager(task, true);

				ev.preventDefault();
			})
		}
	}
	Events.Task = function(elem)
	{
		$(elem).find('.v-task-remove').unbind('click').on('click', function(ev)
		{
			var id = $($(this).parent()).attr('data-id');
			Modules.RemoveTask(id, $($(this).parent()));
			ev.preventDefault();
		})

		$(elem).find('.v-task-edit').unbind('click').on('click', function(ev)
		{
			var id = $($(this).parent()).attr('data-id');
			Modules.EditTask(id, $($(this).parent()));
			ev.preventDefault();
		})
	}
	Events.Window_Buttons = function()
	{
		$('.v-window-btn').on('mouseover', function(ev)
		{
			$(this).tooltip('show');
			$('.v-window-btn').on('mouseleave', function()
			{
				$(this).tooltip('hide');
			})
			ev.preventDefault();
		})
		$('.v-window-btn').unbind('click').on('click', function(ev)
		{
			$(this).tooltip('hide');

			var options = 
			{
				title:"Informações da tarefa",
				icon:"glyphicon glyphicon-info-sign",
				type:"new_task"
			}

			Load.Modal(options)
			ev.preventDefault();
		})
	}

	/* ---------------------------------------------------------- Templates em HTML -------------------------------------------------------------- */

	HTML.Templates.EditForm = function(options, task)
	{
		var template = '';
		template += '<div class = "v-modal-head">'
		template += '<span class = "'+ options.icon +'"></span> '+ options.title;
		template += '</div>'

		template += '<div class = "v-modal-body">'

		for(var i = 0; i < Tasks_Asks.length; i++)
		{
			var component = Tasks_Asks[i];
			template += '<div class = "v-modal-body-data">'
			template += '<div class = "v-data-text">'
			template += component.name
			template += '</div>'

			template += '<div class = "v-data-component">'

			if(component.type == 'text')
				template += '<input type = "'+ component.type +'" value = "'+ task[component.name] +'">'
			else if(component.type == 'textarea')
				template += '<textarea rows = 2 style = "resize: none;">'+ task[component.name] +'</textarea>'
			else if(component.type == 'combo')
			{
				template += '<select style = "height:30px; width:185px;">'
				for(var j = 0; j < component.values.length; j++)
				{
					if(component.values[j] == task[component.name])
						template += '<option selected>'+ component.values[j];
					else
						template += '<option>'+ component.values[j];
					template += '</option>'
				}
				template += '</select>'
			}
			else if(component.type == 'checkbox')
			{
				if(task["Data de abertura"] != null)
					template += '<input type = "checkbox" style = "height:15px; width:15px;" checked>'
				else
					template += '<input type = "checkbox" style = "height:15px; width:15px;">'
			}

			template += '</div>'
			template += '</div>'
		}

		template += '<div class = "v-modal-body-error">'
		template += '</div>'

		template += '<div class = "v-modal-footer">'
		template += '<div class = "v-modal-btn v-modal-btn-ready" title = "Salvar" data-placement = "bottom">'
		template += '<span class = "glyphicon glyphicon-ok"></span>'
		template += '</div>'
		template += '<div class = "v-modal-btn v-modal-btn-cancel" title = "Cancelar" data-placement = "bottom">'
		template += '<span class = "glyphicon glyphicon-remove"></span>'
		template += '</div>'
		template += '</div>'

		return template;
	}
	HTML.Templates.Form = function(options)
	{
		var template = '';
		template += '<div class = "v-modal-head">'
		template += '<span class = "'+ options.icon +'"></span> '+ options.title;
		template += '</div>'

		template += '<div class = "v-modal-body">'

		for(var i = 0; i < Tasks_Asks.length; i++)
		{
			var component = Tasks_Asks[i];
			template += '<div class = "v-modal-body-data">'
			template += '<div class = "v-data-text">'
			template += component.name
			template += '</div>'

			template += '<div class = "v-data-component">'

			if(component.type == 'text')
				template += '<input type = "'+ component.type +'">'
			else if(component.type == 'textarea')
				template += '<textarea rows = 2 max-rows = 2 style = "resize: none;"></textarea>'
			else if(component.type == 'combo')
			{
				template += '<select style = "height:30px; width:185px;">'
				for(var j = 0; j < component.values.length; j++)
				{
					template += '<option>'+ component.values[j];
					template += '</option>'
				}
				template += '</select>'
			}
			else if(component.type == 'checkbox')
				template += '<input type = "checkbox" style = "height:15px; width:15px;" checked>'

			template += '</div>'
			template += '</div>'
		}

		template += '<div class = "v-modal-body-error">'
		template += '</div>'

		template += '<div class = "v-modal-footer">'
		template += '<div class = "v-modal-btn v-modal-btn-ready" title = "Salvar" data-placement = "bottom">'
		template += '<span class = "glyphicon glyphicon-ok"></span>'
		template += '</div>'
		template += '<div class = "v-modal-btn v-modal-btn-cancel" title = "Cancelar" data-placement = "bottom">'
		template += '<span class = "glyphicon glyphicon-remove"></span>'
		template += '</div>'
		template += '</div>'

		return template;
	}
	HTML.Templates.Home = function()
	{
		var template = '';
		template += '<div class = "v-head">'
		template += '<span class = "glyphicon glyphicon-home"></span> Home'
		template += '</div>'
		template += '<div class = "v-window">'
		template += '<b>Bem vindo =)</b> <br><br>'
		template += 'Aqui você será capaz de gerenciar suas tarefas. Você podera:'
		template += '<ul> <li>Criar uma lista;</li> <li>Exportar uma lista(excel);</li> <li>Importar uma lista(criada pelo mecanismo de exportar do sistema).</li> </ul>'
		template += '</div>'
		return template;
	}
	HTML.Templates.MenuBar = function() 
	{
		var template = '';
		template += '<div class = "v-left-bar-item" title = "Nova lista" data-toggle = "tooltip" data-placement = "right" data-click = "new_tasks">'
		template += '<span class = "glyphicon glyphicon-plus"></span>'
		template += '</div>'
		template += '<div class = "v-left-bar-item v-left-bar-mid" title = "Abrir lista" data-toggle = "tooltip" data-placement = "right" data-click = "open_tasks">'
		template += '<span class = "glyphicon glyphicon-folder-open"></span>'
		template += '</div>'
		return template;
	}
	HTML.Templates.Modal = function(width, height)
	{
		var template = '';
		template += '<div class = "v-modal-background">'
		template += '<div class = "v-modal" style = "width:'+ width +'px;">'
		template += '</div>'
		template += '</div>'
		return template;
	}
	HTML.Templates.RemoveTask = function(options, name)
	{
		var template = '';
		template += '<div class = "v-modal-head">'
		template += '<span class = "'+ options.icon +'"></span> '+ options.title;
		template += '</div>'

		template += '<div class = "v-modal-body">'
		template += 'Você realmente deseja remover a tarefa: '+ name +'?';
		template += '</div>'

		template += '<div class = "v-modal-footer">'
		template += '<div class = "v-modal-btn v-modal-btn-warning" title = "Remover" data-placement = "bottom">'
		template += '<span class = "glyphicon glyphicon-trash"></span>'
		template += '</div>'
		template += '<div class = "v-modal-btn v-modal-btn-cancel" title = "Cancelar" data-placement = "bottom">'
		template += '<span class = "glyphicon glyphicon-remove"></span>'
		template += '</div>'
		template += '</div>'

		return template;
	}
	HTML.Templates.Task = function(task)
	{
		var template = ''
		var id = task.id;
		var keys = Object.keys(task);
		var name = task["Nome da tarefa"];
		var status = task["Status"];
		var open_date = task["Data de abertura"];
		var end_date = task["Data de encerramento"];
		var status_color;
		var second, minute, hour, day, month, year;
		
		if(open_date == null || open_date == "")
			open_date = "N/A"

		if(end_date == null || end_date == "")
			end_date = "N/A"

		if(open_date != "N/A")
		{
			second = open_date.getSeconds();
			minute = open_date.getMinutes();
			hour = open_date.getHours();
			day = open_date.getDate();
			month = open_date.getMonth() + 1
			year = ""+ open_date.getFullYear()
			
			if(day < 10)
				day = "0"+ day;
			if(month < 10)
				month = "0"+ month;
			if(hour < 10)
				hour = "0"+ hour;
			if(minute < 10)
				minute = "0"+ minute;
			if(second < 10)
				second = "0"+ second;

			open_date = day +"/"+ month +"/"+ year +" "+ hour +":"+ minute +":"+ second;
		}

		if(end_date != "N/A")
		{
			second = end_date.getSeconds();
			minute = end_date.getMinutes();
			hour = end_date.getHours();
			day = end_date.getDate();
			month = end_date.getMonth() + 1
			year = ""+ end_date.getFullYear()
			
			if(day < 10)
				day = "0"+ day;
		 	if(month < 10)
				month = "0"+ month;
			if(hour < 10)
				hour = "0"+ hour;
			if(minute < 10)
				minute = "0"+ minute;
			if(second < 10)
				second = "0"+ second;

			end_date = day +"/"+ month +"/"+ year +" "+ hour +":"+ minute +":"+ second;
		}

		if(status == "Ativa")
			status_color = "rgb(45,180,60)";
		else if(status == "Encerrada")
			status_color = "rgb(180,45,60)";

		template += '<tr data-id = "'+ task.id +'">'
		template += '<td>'+ name;
		template += '</td>'
		
		template += '<td style = "color:'+ status_color +'">'+ status;
		template += '</td>'
		
		template += '<td>'+ open_date
		template += '</td>'

		template += '<td>'+ end_date
		template += '</td>'

		template += '<td class = "v-task-edit" title = "Editar">'
		template += '<span class = "glyphicon glyphicon-edit"></span>'
		template += '</td>'
		template += '<td class = "v-task-remove" title = "Remover">'
		template += '<span class = "glyphicon glyphicon-trash"></span>'
		template += '</td>'
		template += '</tr>'
		return template;
	}
	HTML.Templates.Tasks = function()
	{
		var template = '';
		template += '<div class = "v-head">'
		template += '<span class = "glyphicon glyphicon-list"></span> Tarefas a serem feitas'
		template += '</div>'
		template += '<div class = "v-window table-responsive">'
		template += '<div class = "v-window-msg"> Nenhuma tarefa foi adicionada.'
		template += '</div>'
		template += '<table class = "table table-bordered" style = "display:none">'
		template += '<thead>'
		template += '<th>Nome</th>'
		template += '<th>Status</th>'
		template += '<th>Aberta em</th>'
		template += '<th>Encerrada em</th>'
		template += '<th style = "width:50px;">Editar</th>'
		template += '<th style = "width:50px;">Remover</th>'
		template += '</thead>'
		template += '<tbody>'
		template += '</tbody>'
		template += '</table>'
		template += '<div class = "v-window-btns">'
		template += '<div class = "v-window-btn v-window-btn-ready" title = "Adicionar tarefa">'
		template += '<span class = "glyphicon glyphicon-plus"></span>'
		template += '</div>'
		template += '</div>'
		template += '</div>'
		return template;
	}

	/* ---------------------------------------------------------- Funções para carregamento de objetos e eventos ----------------------------------- */

	Load.Home = function()
	{
		var margin_top;
		var elem = $('.v-container');

		elem.append(HTML.Templates.Home);
	}
	Load.MenuBar = function()
	{	
		var margin_top;
		var elem = $('.v-left-bar');	

		elem.append(HTML.Templates.MenuBar);
		elem.fadeIn(300);
		elem.css('height', $('body').height() - 60)

		Events.MenuBar();
	}
	Load.Modal = function(options)
	{
		var width = 800;
		var height = 0;
		var margin_top = 0;
		var margin_left = 0;
		var type = options.type;
		
		if(options.width)
			width = options.width;
		else if(options.height)
			height = options.height;

		$('body').append(HTML.Templates.Modal(width, height));

		if(type == 'new_task')
			$('.v-modal').append(HTML.Templates.Form(options));
		else if(type == 'remove_task')
			$('.v-modal').append(HTML.Templates.RemoveTask(options, selected.task["Nome da tarefa"]));
		else if(type == 'edit_task')
			$('.v-modal').append(HTML.Templates.EditForm(options, selected.task));

		margin_top = $('body').height()/2 - $('.v-modal').height()/2;
		margin_left = $('body').width()/2 - $('.v-modal').width()/2;

		$('.v-modal').css(
		{
			'margin-top': margin_top,
			'margin-left': margin_left
		})
		$('.v-modal').fadeIn(50);

		Events.Modal(type);
	}
	Load.Tasks = function()
	{
		var body = $(".v-window").find('table').find('tbody').empty();

		if(Tasks.length > 0 )
		{
			for(var i = 0; i < Tasks.length; i++)
			{
				var task = Tasks[i];
				body.append(HTML.Templates.Task(task));
				elem = body.children()
				elem = $(elem[elem.length - 1]);
				Events.Task(elem);
			}

			$(".v-window").find('.v-window-msg').hide();	
			$(".v-window").find('table').fadeIn(200);
		}
		else
		{
			$(".v-window").find('table').hide();
			$(".v-window").find('.v-window-msg').fadeIn(200);
		}
	}

	/* ---------------------------------------------------------- Funções unload servem para remover elementos carregados ----------------------------------- */

	Unload.Modal = function(now)
	{
		if(!now)
		{
			setTimeout(function()
			{
				$('.v-modal-background').remove();	
			},300)
		}
		else
			$('.v-modal-background').remove();	
	}

	/* ---------------------------------------------------------- Funções disparadas em eventos vinculados ao sistema ----------------------------------- */


	Modules.EditTask = function(id, elem)
	{
		var options = 
		{
			title:"Remover tarefa",
			icon:"glyphicon glyphicon-info-sign",
			type:"edit_task"
		}

		for(var i = 0; i < Tasks.length; i++)
		{
			var task = Tasks[i];
			if(task.id == id)
			{
				selected.task = task;
				break;
			}
		}

		selected.elem = elem;
		Load.Modal(options);
	}
	Modules.GetTaskData = function(update)
	{
		var task = {};
		var valid = true;
		var error_msg = '';

		if(update)
			task = selected.task

		$('.v-modal-body-error').fadeOut(100).empty();
		$('.v-modal-body-data').each(function()
		{
			var name = $(this).find('.v-data-text').text();
			var ask;
			var value;
			
			for(var i = 0; i < Tasks_Asks.length; i++)
			{
				if(Tasks_Asks[i].name == name)
				{
					ask = Tasks_Asks[i];
					break;
				}
			}

			if(ask.type != 'checkbox')
			{
				value = $(this).find('.v-data-component').children(0).val()
				task[name] = value;
			}
			else
				value = $(this).find('.v-data-component').children(0).prop('checked');

			if(ask.mandatory && (value == "" || !value))
			{
				if(error_msg != "")
					error_msg += '<br>';

				error_msg += 'O campo <b>'+ name +'</b> deve ser informado.';
				valid = false;
			}
		})
		if(!valid)
		{
			$('.v-modal-body-error').append(error_msg).fadeIn(100);	
			task = null;
		}

		return task;
	}
	Modules.NewTasks = function()
	{
		var elem = $('.v-container').empty().append(HTML.Templates.Tasks())
		Events.Window_Buttons();
		Load.Tasks();
	}
	Modules.TaskManager = function(task, update)
	{	
		var tasks = [];

		if(!update)
		{
			task.id = ++Tasks_Count;
			task["Data de abertura"] = new Date();
			
			Tasks.push(task);
		}
		else
		{
			if(task["Status"] == "Ativa")
				task["Data de encerramento"] = null;
			else
				task["Data de encerramento"] = new Date();
		}

		for(var i = 0; i < Tasks.length; i++)
		{
			if(Tasks[i]["Status"] == "Ativa")
			{
				tasks.push(Tasks.splice(i, 1)[0])
				i--;
			}
		}

		for(var i = 0; i < Tasks.length; i++)
		{
			tasks.push(Tasks.splice(i, 1)[0])
			i--;
		}

		Tasks = tasks;
		Load.Tasks();
		Unload.Modal(true);
	}
	Modules.RemoveTask = function(id, elem)
	{
		var options = 
		{
			title:"Remover tarefa",
			icon:"glyphicon glyphicon-info-sign",
			width:500,
			type:"remove_task"
		}

		for(var i = 0; i < Tasks.length; i++)
		{
			var task = Tasks[i];
			if(task.id == id)
			{
				selected.task = task;
				break;
			}
		}

		selected.elem = elem;
		Load.Modal(options);
	}

	/* ---------------------------------------------------------- Prototypos de dados utilizados --------------------------------------------------------- */

	Prototypes.Task =  function()  //armazena de fato as informações
	{
		this.open_data;
		this.close_data;
		this.status;
		this.descrição;
		this.type;
	}
	Prototypes.TaskAsk = function() //apenas para renderizãção
	{
		this.name;
		this.type;
		this.values;
		this.mandatory;
	}

	Start = function()
	{

		var task_name = new Prototypes.TaskAsk();
		var task_data = new Prototypes.TaskAsk();
		var task_status = new Prototypes.TaskAsk();
		var task_description = new Prototypes.TaskAsk();
		var task_update_open = new Prototypes.TaskAsk();

		task_name.name = "Nome da tarefa";
		task_name.type = "text"; 
		task_name.mandatory = true;

		task_status.name = "Status";
		task_status.type = "combo";
		task_status.values = ["Ativa", "Encerrada"];
		task_status.mandatory = true;

		task_description.name = "Descrição";
		task_description.type = "textarea";
		task_description.mandatory = false;

		Tasks_Asks.push(task_name);
		Tasks_Asks.push(task_status);
		Tasks_Asks.push(task_description);
	}

	Start();
}

Engine.controller('Init', function($rootScope)
{
	$rootScope.Handlers = new Handlers();
})
Engine.controller('Left_Bar', function($scope, $rootScope)
{
	var Handlers = $rootScope.Handlers;
	Handlers.Load.MenuBar();
})
Engine.controller('Window', function($rootScope)
{
	var Handlers = $rootScope.Handlers;
	Handlers.Load.Home();
})
