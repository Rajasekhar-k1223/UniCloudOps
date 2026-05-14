resource "aws_lb" "mission_lb" {
  name               = var.lb_name
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_id]
  subnets            = var.subnet_ids

  enable_deletion_protection = false

  tags = {
    Environment = "Sovereign"
    Project     = var.project_name
  }
}

resource "aws_lb_target_group" "mission_tg" {
  name     = "${var.lb_name}-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id
}

resource "aws_lb_listener" "front_end" {
  load_balancer_arn = aws_lb.mission_lb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.mission_tg.arn
  }
}

variable "lb_name" { type = string }
variable "security_group_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "vpc_id" { type = string }
variable "project_name" { type = string }
