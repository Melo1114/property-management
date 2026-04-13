from django.db import migrations, models


def fix_blank_emails(apps, schema_editor):
    """Give any user with a blank email a placeholder so unique constraint works."""
    User = apps.get_model('accounts', 'User')
    for user in User.objects.filter(email=''):
        user.email = f'{user.username}@placeholder.aurumkeys.local'
        user.save(update_fields=['email'])


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        # 1. Add address field (always safe)
        migrations.AddField(
            model_name='user',
            name='address',
            field=models.TextField(blank=True, default=''),
            preserve_default=False,
        ),

        # 2. Update role choices
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('Admin',           'Administrator'),
                    ('PropertyManager', 'Property Manager'),
                    ('Tenant',          'Tenant'),
                    ('Vendor',          'Vendor'),
                    ('Accountant',      'Accountant'),
                ],
                default='Tenant',
                max_length=20,
            ),
        ),

        # 3. Fix blank emails first, then apply unique constraint
        migrations.RunPython(fix_blank_emails, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(max_length=254, unique=True),
        ),
    ]
