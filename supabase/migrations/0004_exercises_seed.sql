-- =====================================================================
-- Ultra Personal Trainer - Seed da biblioteca global de exercicios
-- Todos com is_global = true, sem trainer_id
-- =====================================================================

insert into public.exercises (name, muscle_group, equipment, level, modality, youtube_id, is_global) values
-- Peito
('Supino reto com barra', 'Peito', 'Barra', 'intermediario', 'musculacao', 'rT7DgCr-3pg', true),
('Supino reto com halteres', 'Peito', 'Halteres', 'iniciante', 'musculacao', 'VmB1G1K7v94', true),
('Supino inclinado com halteres', 'Peito', 'Halteres', 'intermediario', 'musculacao', '8iPEnn-ltC8', true),
('Crucifixo com halteres', 'Peito', 'Halteres', 'iniciante', 'musculacao', 'eozdVDA78K0', true),
('Crossover na polia', 'Peito', 'Polia', 'intermediario', 'musculacao', 'taI4XduLpTk', true),
('Flexao de braco', 'Peito', 'Peso corporal', 'iniciante', 'musculacao', 'IODxDxX7oi4', true),
('Mergulho em paralelas', 'Peito', 'Paralelas', 'avancado', 'musculacao', '2z8JmcrW-As', true),

-- Costas
('Barra fixa pronada', 'Costas', 'Barra fixa', 'avancado', 'musculacao', 'eGo4IYlbE5g', true),
('Puxada alta na polia', 'Costas', 'Polia', 'iniciante', 'musculacao', 'CAwf7n6Luuc', true),
('Remada curvada com barra', 'Costas', 'Barra', 'intermediario', 'musculacao', 'kBWAon7ItDw', true),
('Remada baixa na polia', 'Costas', 'Polia', 'iniciante', 'musculacao', 'GZbfZ033f74', true),
('Remada serrote com halter', 'Costas', 'Halteres', 'iniciante', 'musculacao', 'roCP6wCXPqo', true),
('Pulldown com triangulo', 'Costas', 'Polia', 'iniciante', 'musculacao', 'rgDjyfnTcLY', true),
('Levantamento terra', 'Costas', 'Barra', 'avancado', 'musculacao', 'op9kVnSso6Q', true),

-- Pernas
('Agachamento livre com barra', 'Pernas', 'Barra', 'avancado', 'musculacao', 'ultWZbUMPL8', true),
('Agachamento sumo', 'Pernas', 'Barra', 'intermediario', 'musculacao', 'PUMpZUFV9XI', true),
('Leg press 45', 'Pernas', 'Maquina', 'iniciante', 'musculacao', 'IZxyjW7MPJQ', true),
('Cadeira extensora', 'Pernas', 'Maquina', 'iniciante', 'musculacao', 'YyvSfVjQeL0', true),
('Mesa flexora', 'Pernas', 'Maquina', 'iniciante', 'musculacao', '1Tq3QdYUuHs', true),
('Stiff com barra', 'Pernas', 'Barra', 'intermediario', 'musculacao', '2SHsk9AzdjA', true),
('Avanco com halteres', 'Pernas', 'Halteres', 'intermediario', 'musculacao', '3XDriUn0udo', true),
('Cadeira adutora', 'Pernas', 'Maquina', 'iniciante', 'musculacao', 'ftmJyfUEEfA', true),
('Cadeira abdutora', 'Pernas', 'Maquina', 'iniciante', 'musculacao', 'sxn9fAkkzD0', true),
('Panturrilha em pe', 'Pernas', 'Maquina', 'iniciante', 'musculacao', '_qOEV6lFlBg', true),
('Panturrilha sentado', 'Pernas', 'Maquina', 'iniciante', 'musculacao', 'JbyjNymZOt0', true),
('Hip thrust com barra', 'Gluteos', 'Barra', 'intermediario', 'musculacao', 'SEdqd1n0cvg', true),
('Elevacao pelvica', 'Gluteos', 'Peso corporal', 'iniciante', 'musculacao', 'wPM8icPu6H8', true),
('Bulgarian split squat', 'Pernas', 'Halteres', 'avancado', 'musculacao', '2C-uNgKwPLE', true),

-- Ombros
('Desenvolvimento militar com barra', 'Ombros', 'Barra', 'avancado', 'musculacao', '2yjwXTZQDDI', true),
('Desenvolvimento com halteres', 'Ombros', 'Halteres', 'iniciante', 'musculacao', 'qEwKCR5JCog', true),
('Elevacao lateral com halteres', 'Ombros', 'Halteres', 'iniciante', 'musculacao', '3VcKaXpzqRo', true),
('Elevacao frontal com halteres', 'Ombros', 'Halteres', 'iniciante', 'musculacao', '-t7fuZ0KhDA', true),
('Crucifixo invertido', 'Ombros', 'Halteres', 'intermediario', 'musculacao', 'Y6gWB1d4XXI', true),
('Remada alta com barra', 'Ombros', 'Barra', 'intermediario', 'musculacao', 'lfQ4JZSCDQM', true),
('Encolhimento com halteres', 'Trapezio', 'Halteres', 'iniciante', 'musculacao', 'cJRVVxmytaM', true),

-- Bracos
('Rosca direta com barra', 'Biceps', 'Barra', 'iniciante', 'musculacao', 'kwG2ipFRgfo', true),
('Rosca direta com halteres', 'Biceps', 'Halteres', 'iniciante', 'musculacao', 'in7PaeYlhrM', true),
('Rosca alternada', 'Biceps', 'Halteres', 'iniciante', 'musculacao', 'sAq_ocpRh_I', true),
('Rosca martelo', 'Biceps', 'Halteres', 'iniciante', 'musculacao', 'zC3nLlEvin4', true),
('Rosca scott', 'Biceps', 'Barra W', 'intermediario', 'musculacao', 'fIWP-FRFNU0', true),
('Triceps testa com barra', 'Triceps', 'Barra W', 'intermediario', 'musculacao', 'd_KZxkY_0cM', true),
('Triceps frances com halter', 'Triceps', 'Halteres', 'intermediario', 'musculacao', '_gsUck-7M74', true),
('Triceps na polia', 'Triceps', 'Polia', 'iniciante', 'musculacao', 'vB5OHsJ3EME', true),
('Triceps coice', 'Triceps', 'Halteres', 'iniciante', 'musculacao', '6SS6K3lAwY8', true),
('Mergulho no banco', 'Triceps', 'Banco', 'iniciante', 'musculacao', '6kALZikXxLc', true),

-- Abdomen
('Abdominal supra', 'Abdomen', 'Peso corporal', 'iniciante', 'musculacao', '1fbU_MkV7NE', true),
('Prancha frontal', 'Abdomen', 'Peso corporal', 'iniciante', 'funcional', 'pSHjTRCQxIw', true),
('Prancha lateral', 'Abdomen', 'Peso corporal', 'intermediario', 'funcional', 'wqzrb67Dwf8', true),
('Abdominal infra', 'Abdomen', 'Peso corporal', 'iniciante', 'musculacao', 'JB2oyawG9KI', true),
('Abdominal oblique', 'Abdomen', 'Peso corporal', 'iniciante', 'musculacao', '8ZoaP_v2ne0', true),
('Mountain climber', 'Abdomen', 'Peso corporal', 'intermediario', 'funcional', 'nmwgirgXLYM', true),
('Russian twist', 'Abdomen', 'Peso corporal', 'intermediario', 'musculacao', 'wkD8rjkodUI', true),
('Abdominal canivete', 'Abdomen', 'Peso corporal', 'avancado', 'musculacao', 'rE8gTaiAdkA', true),

-- Funcional
('Burpee', 'Corpo todo', 'Peso corporal', 'avancado', 'funcional', 'TU8QYVW0gDU', true),
('Jumping jacks', 'Corpo todo', 'Peso corporal', 'iniciante', 'funcional', 'iSSAk4XCsRA', true),
('Box jump', 'Pernas', 'Caixa', 'avancado', 'funcional', 'NBY9-kTuHEk', true),
('Kettlebell swing', 'Corpo todo', 'Kettlebell', 'intermediario', 'funcional', 'YSxHifyI6s8', true),
('Goblet squat', 'Pernas', 'Kettlebell', 'iniciante', 'funcional', 'MeIiIdhvXT4', true),
('Farmer walk', 'Corpo todo', 'Halteres', 'intermediario', 'funcional', 'Fkzk_RqlYig', true),
('Wall ball', 'Corpo todo', 'Medicine ball', 'intermediario', 'funcional', 'fpPbrXGWwOk', true),

-- Aerobico
('Esteira - corrida moderada', 'Cardio', 'Esteira', 'iniciante', 'aerobico', 'kVnyY17VS9Y', true),
('Bicicleta ergometrica', 'Cardio', 'Bike', 'iniciante', 'aerobico', 'QhmkpdHxqQc', true),
('Eliptico', 'Cardio', 'Eliptico', 'iniciante', 'aerobico', 'gEGUkXzWzLA', true),
('Remo ergometro', 'Cardio', 'Remo', 'intermediario', 'aerobico', 'H0r_ZPXJLtg', true),
('Pular corda', 'Cardio', 'Corda', 'iniciante', 'aerobico', 'FJmRQ5iTXKE', true),

-- Alongamento e mobilidade
('Alongamento de peitoral', 'Peito', 'Peso corporal', 'iniciante', 'alongamento', 'SrqOu55lrYU', true),
('Alongamento de posterior', 'Pernas', 'Peso corporal', 'iniciante', 'alongamento', 'LrvnSJTCUws', true),
('Alongamento de quadril', 'Quadril', 'Peso corporal', 'iniciante', 'alongamento', 'rxZS4d3qAsU', true),
('Cat camel', 'Coluna', 'Peso corporal', 'iniciante', 'mobilidade', 'kQjrGlfyu_E', true),
('Childs pose', 'Coluna', 'Peso corporal', 'iniciante', 'alongamento', 'kH8jfMQIxgA', true),
('Cobra stretch', 'Coluna', 'Peso corporal', 'iniciante', 'alongamento', 'JDcdhTuycOI', true),
('World greatest stretch', 'Corpo todo', 'Peso corporal', 'intermediario', 'mobilidade', 'M91EgVtqs6Q', true)

on conflict do nothing;
